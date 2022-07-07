export function ReadOnlyFunctionArgsToJSON(
  value?: { sender: string; arguments: string[] } | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    sender: value.sender,
    arguments: value.arguments,
  };
}
