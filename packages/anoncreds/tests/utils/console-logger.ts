export enum LogLevel {
  test = 0,
  trace = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6,
  off = 7,
}

export class ConsoleLogger {
  private readonly logLevel: LogLevel

  constructor(logLevel?: LogLevel) {
    this.logLevel = logLevel ?? LogLevel.off
  }

  public test = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.test, message, data)
  public trace = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.trace, message, data)
  public debug = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.debug, message, data)
  public info = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.info, message, data)
  public warn = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.warn, message, data)
  public error = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.error, message, data)
  public fatal = <T>(message: string, data?: Record<string, T>) => this.write(LogLevel.fatal, message, data)

  private isEnabled(logLevel: LogLevel): boolean {
    return this.logLevel <= logLevel
  }

  public write<T>(logLevel: LogLevel, message: string, data?: Record<string, T>): void {
    if (!this.isEnabled(logLevel)) return
    console.log(message, JSON.stringify(data))
  }
}
