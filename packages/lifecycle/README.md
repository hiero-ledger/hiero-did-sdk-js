# @hashgraph-did-sdk/lifecycle

This package provides a lifecycle management system for orchestrating complex asynchronous operations within the Hashgraph DID SDK. It enables developers to define sequences of steps, handle asynchronous actions, manage signatures, and control the flow of execution with features like pausing and resuming. By streamlining these processes, it simplifies the development of robust and reliable DID-related applications.

## Features

*   **Step-by-Step Execution:** Define a clear sequence of asynchronous steps for DID operations.
*   **Callback Integration:** Incorporate custom callback functions at any point in the lifecycle.
*   **Signature Handling:** Include signature generation and verification steps seamlessly.
*   **Pause/Resume Functionality:** Introduce pauses for manual intervention or external interactions, and resume execution when ready.
*   **Error Handling:** Implement robust error handling with catch steps to gracefully handle exceptions.
*   **Flexible Builder Pattern:** Provides a fluent API for building and configuring lifecycles with ease.
*   **TypeScript Support:** Built with TypeScript for enhanced developer experience and type safety.

## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/lifecycle
```

## Usage

Learn how to use the lifecycle management system to orchestrate complex asynchronous operations for DID management in the [Lifecycle Management Guide](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/guides/lifecycle-management-guide.html).

## API Reference

Learn more in the [Lifecycle Management API Reference](https://swiss-digital-assets-institute.github.io/hashgraph-did-sdk-js/documentation/0.0.1/04-implementation/components-api/lifecycle-management-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

  * [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
  * [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.