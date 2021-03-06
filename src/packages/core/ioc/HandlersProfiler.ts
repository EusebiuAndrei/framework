import { Container } from 'inversify';
import path from 'path';
import { EventType, getHandlerMetadata } from '../../mem-events';
import { MemMediator } from '../../mem-events';
import getModules from '../helpers/getModules';

class HandlersProfiler {
  public static async profile(container: Container): Promise<any[]> {
    const modulesDirPath = path.join(__dirname, '..', '..', '..', 'modules');
    const modules = await getModules(modulesDirPath, HandlersProfiler.check);

    const handlers = [];
    for (const module of modules) {
      const { default: Handler } = await import(module.path);
      container.bind<typeof Handler>(Handler).toSelf();
      handlers.push(container.get(Handler));
    }

    HandlersProfiler.registerHandlers(container, handlers);

    return handlers;
  }

  private static check(fileName: string) {
    const moduleNameUppercase = fileName.toUpperCase();
    return (
      moduleNameUppercase.endsWith(EventType.QUERY) ||
      moduleNameUppercase.endsWith(EventType.COMMAND) ||
      moduleNameUppercase.endsWith(EventType.EVENT)
    );
  }

  private static registerHandlers(container: Container, handlers: any[]) {
    handlers.forEach((handler) => {
      const meta = getHandlerMetadata(handler);
      const callback = handler.handle.bind(handler);

      if (meta.kind === EventType.EVENT) {
        (container.get('ee') as any).on(meta.event.name, callback);
      } else {
        (container.get(MemMediator) as any).on(meta.event.name, callback);
      }
    });
  }
}

export default HandlersProfiler;
