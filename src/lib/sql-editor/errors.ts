export class SqlEditorConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqlEditorConfigurationError';
  }
}
