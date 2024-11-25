# @hashgraph-did-sdk/lifecycle

This package provides a powerful and flexible lifecycle management system for orchestrating complex asynchronous operations within the [Hashgraph DID SDK](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js). It enables developers to define sequences of steps, handle asynchronous actions, manage signatures, and control the flow of execution with features like pausing and resuming. By streamlining these processes, it simplifies the development of robust and reliable DID-related applications.

## Features

- **Step-by-Step Execution:** Define a clear sequence of asynchronous steps for DID operations.
- **Callback Integration:**  Incorporate custom callback functions at any point in the lifecycle.
- **Signature Handling:**  Include signature generation and verification steps seamlessly.
- **Pause/Resume Functionality:**  Introduce pauses for manual intervention or external interactions, and resume execution when ready.
- **Error Handling:** Implement robust error handling with catch steps to gracefully handle exceptions.
- **Flexible Builder Pattern:** Provides a fluent API for building and configuring lifecycles with ease.
- **TypeScript Support:**  Built with TypeScript for enhanced developer experience and type safety.


## Installation

Install the package via npm:

```bash
npm install @hashgraph-did-sdk/lifecycle
```

## Usage

This package is primarily intended for internal use within the `@hashgraph-did-sdk`. However, it can be adapted for other use cases if needed.

### Building and Running a Lifecycle

```typescript
import { LifecycleRunner, LifecycleBuilder } from '@hashgraph-did-sdk/lifecycle';

// 1. Define the lifecycle steps using the builder
const builder = new LifecycleBuilder()
  .callback(async (context) => {
    // Perform an asynchronous operation
    context.data = await fetchData(); 
  })
  .signWithSigner() // Sign the data
  .pause()  // Pause execution (e.g., to wait for user confirmation)
  .callback(async (context) => {
    // Continue with the next step
    await submitData(context.data);
  })
  .catch((error) => {
    // Handle errors gracefully
    console.error('Lifecycle error:', error);
  });

// 2. Create a lifecycle runner
const runner = new LifecycleRunner(builder.build()); // Build the lifecycle

// 3. Execute the lifecycle
const state = await runner.process(message, { 
  // Provide necessary context (e.g., signer, publisher)
});

// 4. Handle lifecycle state (e.g., paused, completed)
if (state.status === 'pause') {
  // ... later, resume the lifecycle
  const resumedState = await runner.resume(state, {
    // Provide updated context if needed
  });
}
```

## API Reference

- **`LifecycleBuilder`** 
    - `callback(callback: (context: LifecycleContext) => Promise<void> | void)`: Adds a callback step to the lifecycle.
    - `signature()`: Adds a signature generation step.
    - `signWithSigner()`: Adds a signing step using a signer.
    - `pause()`: Adds a pause step that requires manual continuation.
    - `catch(callback: (error: unknown) => void)`: Adds a catch step for error handling.
    - `build()`: Builds the lifecycle.

- **`LifecycleRunner`**
    - `process(message: any, context: LifecycleContext)`: Executes the lifecycle steps until a pause or completion.
    - `resume(state: LifecycleState, context: LifecycleContext)`: Resumes a paused lifecycle from the given state.


## Error Handling

The lifecycle execution may throw errors if any of the steps fail. The `catch` step can be used to handle these errors gracefully.

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