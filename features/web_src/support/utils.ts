export interface ScenarioInformation {
  name: string,
  path: string,
  step: number,
}

export function getCurrentScenario(): ScenarioInformation {
  let args = process.argv
  args = args.filter(args => args.match(/feature$/))
  if (args.length === 0 || typeof args[0] !== 'string') {
    throw new Error('No feature file found')
  }
  let name = args[0].match(/features\/(?<name>.*)\.feature/)?.groups?.name
  if (!name) {
    throw new Error('No feature file found')
  }
  return {
    name,
    path: args[0],
    step: 0,
  }
}

