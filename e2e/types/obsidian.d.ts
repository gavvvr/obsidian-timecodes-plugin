import Plugin from 'obsidian'

declare module 'obsidian' {
  interface App {
    plugins: {
      plugins: Record<string, Plugin>
      setEnable(toggle: boolean): void
      enablePlugin(pluginId: string): void
    }
    commands: {
      executeCommandById: (id: string) => boolean
    }
  }
}
