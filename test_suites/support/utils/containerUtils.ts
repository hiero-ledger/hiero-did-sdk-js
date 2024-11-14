import { GenericContainer, Network, PullPolicy, StartedNetwork, StartedTestContainer, Wait } from 'testcontainers';

let network: StartedNetwork;
let containers: StartedTestContainer[] = [];

export async function startContainers(configPath: string): Promise<void> {
    network = await new Network().start();
    const { consensusNode, postgres } = await startConsensusNode(configPath, network);
    const mirrorGrpc = await startMirrorNodeGrpc(configPath, network, postgres);
    const mirrorRest = await startMirrorNodeRest(configPath, network, postgres);
    const importer = await startMirrorNodeImporter(configPath, network, postgres);
    const monitor = await startMirrorNodeMonitor(configPath, network);

    containers.push(consensusNode, postgres, mirrorGrpc, mirrorRest, importer, monitor);
}

async function startConsensusNode(configPath: string, network: StartedNetwork): Promise<{ consensusNode: StartedTestContainer, postgres: StartedTestContainer; }>  {
    const consensusNode = await new GenericContainer('gcr.io/hedera-registry/consensus-node:0.54.0-alpha.5')
        .withUser('root')
        .withName('network-node-single')
        .withNetworkAliases('network-node-single')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withDefaultLogDriver()
        .withNetwork(network)
        .withExposedPorts(
            { container: 50211, host: 50211 },
            { container: 50212, host: 50212 },
            { container: 9999, host: 9999 }
        )
        .withBindMounts([
            { source: `${configPath}/network_logs/accountBalances`, target: '/opt/hgcapp/accountBalances' },
            { source: `${configPath}/network_logs/recordStreams`, target: '/opt/hgcapp/recordStreams' }
        ])
        .withCopyFilesToContainer([
            { source: `${configPath}/settings/network-node/entrypoint.sh`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/myentrypoint.sh' },
            { source: `${configPath}/settings/network-node/config.txt`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/config.txt' },
            { source: `${configPath}/settings/network-node/settings.txt`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/settings.txt' },
            { source: `${configPath}/settings/network-node/log4j2.xml`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/log4j2.xml' },
            { source: `${configPath}/settings/network-node/hedera.crt`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/hedera.crt' },
            { source: `${configPath}/settings/network-node/hedera.key`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/hedera.key' }
        ])
        .withCopyDirectoriesToContainer([
            { source: `${configPath}/settings/network-node/data/config`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/data/config' },
            { source: `${configPath}/settings/network-node/data/keys`, target: '/opt/hgcapp/services-hedera/HapiApp2.0/data/keys' },
            { source: `${configPath}/settings/record-parser`, target: '/opt/hgcapp/recordParser' }
        ])
        .withEnvironment(
            {
                'JAVA_HEAP_MIN': '256m',
                'JAVA_HEAP_MAX': '2g',
                'JAVA_OPTS': '-XX:+UnlockExperimentalVMOptions -XX:+UseZGC -Xlog:gc*:gc.log'
            }
        )
        .withWaitStrategy(Wait.forLogMessage('TLS gRPC server listening on port').withStartupTimeout(1000 * 60 * 5))
        .start();

    const postgres = await new GenericContainer('ghcr.io/mhga24/postgres:latest')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withNetwork(network)
        .withDefaultLogDriver()
        .withExposedPorts(
            { host: 5432, container: 5432 }
        )
        .withUser('root')
        .withName('mirror-node-db-single')
        .withNetworkAliases('mirror-node-db-single')
        .withCopyFilesToContainer([
            { source: `${configPath}/settings/mirror-node/init.sh`, target: '/docker-entrypoint-initdb.d/init.sh' }
        ])
        .withEnvironment({
            'POSTGRES_HOST_AUTH_METHOD': 'scram-sha-256',
            'POSTGRES_INITDB_ARGS': '--auth-host=scram-sha-256',
            'GRPC_PASSWORD': 'mirror_grpc_pass',
            'IMPORTER_PASSWORD': 'mirror_importer_pass',
            'OWNER_PASSWORD': 'mirror_node_pass',
            'POSTGRES_PASSWORD': 'postgres_password',
            'REST_PASSWORD': 'mirror_api_pass',
            'ROSETTA_PASSWORD': 'mirror_rosetta_pass'
        })
        .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
        .start();

    return { postgres, consensusNode };
}

async function startMirrorNodeGrpc(configPath: string, network: StartedNetwork, db: StartedTestContainer): Promise<StartedTestContainer> {
    return await new GenericContainer('gcr.io/mirrornode/hedera-mirror-grpc:0.114.1')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withDefaultLogDriver()
        .withNetwork(network)
        .withExposedPorts(
            { container: 5600, host: 5600 }
        )
        .withUser('root')
        .withName('mirror-node-grpc-single')
        .withNetworkAliases('mirror-node-grpc-single')
        .withCopyFilesToContainer([
            { source: `${configPath}/settings/mirror-node/application.yml`, target: '/usr/etc/hedera-mirror-grpc/application.yml' }
        ])
        .withEnvironment({
            'JAVA_HEAP_MIN': '64m',
            'JAVA_HEAP_MAX': '256m',
            'HEDERA_MIRROR_GRPC_DB_HOST': db.getIpAddress('bridge'),
            'SPRING_CONFIG_ADDITIONAL_LOCATION': 'file:/usr/etc/hedera-mirror-grpc/'
        })
        .withWaitStrategy(Wait.forLogMessage('Started GrpcApplication'))
        .start();
}

async function startMirrorNodeRest(configPath: string, network: StartedNetwork, db: StartedTestContainer): Promise<StartedTestContainer> {
    return await new GenericContainer('gcr.io/mirrornode/hedera-mirror-rest:0.114.1')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withDefaultLogDriver()
        .withNetwork(network)
        .withExposedPorts(
            { container: 5551, host: 5551 }
        )
        .withUser('root')
        .withName('mirror-node-rest-single')
        .withNetworkAliases('mirror-node-rest-single')
        .withEnvironment({
            'JAVA_HEAP_MIN': '64m',
            'JAVA_HEAP_MAX': '256m',
            'HEDERA_MIRROR_REST_DB_HOST': db.getIpAddress('bridge'),
        })
        .withWaitStrategy(Wait.forLogMessage('Startup Server running'))
        .start();
}

async function startMirrorNodeImporter(configPath: string, network: StartedNetwork, db: StartedTestContainer): Promise<StartedTestContainer> {
    return await new GenericContainer('gcr.io/mirrornode/hedera-mirror-importer:0.114.1')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withNetwork(network)
        .withUser('root')
        .withName('mirror-node-importer-single')
        .withNetworkAliases('mirror-node-importer-single')
        .withBindMounts([
            { source: `${configPath}/network_logs/accountBalances/balance0.0.3`, target: '/node/streams/accountBalances/balance0.0.3' },
            { source: `${configPath}/network_logs/recordStreams/record0.0.3`, target: '/node/streams/recordstreams/record0.0.3' }
        ])
        .withCopyFilesToContainer([
            { source: `${configPath}/settings/mirror-node/application.yml`, target: '/usr/etc/hedera-mirror-importer/application.yml' },
            { source: `${configPath}/settings/mirror-node/addressBook.bin`, target: '/usr/etc/hedera-mirror-importer/local-dev-1-node.addressbook.f102.json.bin' }
        ])
        .withEnvironment({
            'HEDERA_MIRROR_IMPORTER_DB_HOST': db.getIpAddress('bridge'),
            'SPRING_CONFIG_ADDITIONAL_LOCATION': 'file:/usr/etc/hedera-mirror-importer/',
        })
        .withWaitStrategy(Wait.forLogMessage('Started ImporterApplication'))
        .start();
}

async function startMirrorNodeMonitor(configPath: string, network: StartedNetwork): Promise<StartedTestContainer> {
    return await new GenericContainer('gcr.io/mirrornode/hedera-mirror-monitor:0.114.1')
        .withPullPolicy(PullPolicy.alwaysPull())
        .withNetwork(network)
        .withUser('root')
        .withName('mirror-node-monitor-single')
        .withNetworkAliases('mirror-node-monitor-single')
        .withCopyFilesToContainer([
            { source: `${configPath}/settings/mirror-node/application.yml`, target: '/usr/etc/hedera-mirror-monitor/application.yml' }
        ])
        .withEnvironment(
            {
                'JAVA_HEAP_MIN': '64m',
                'JAVA_HEAP_MAX': '256m',
                'SPRING_CONFIG_ADDITIONAL_LOCATION': 'file:/usr/etc/hedera-mirror-monitor/'
            }
        )
        .withWaitStrategy(Wait.forLogMessage('Started MonitorApplication'))
        .start();
}

export async function stopContainers(): Promise<void> {
    for (const container of containers) {
        await container.stop();
    }
    network.stop();
}
