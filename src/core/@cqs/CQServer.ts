import express, { Express } from 'express';
import { DecorateWithCQSProps } from './decorateWithCQS';
import Logger from '../Logger';
import { port } from '../../config';
import ErrorHandler from './ErrorHandler';
import MiddlewareHandler from './MiddlewareHandler';
import QueryHandler from './QueryHandler';
import MutationHandler from './MutationHandler';
import generator from 'express-oas-generator';

interface CQServerProps<TContext, TInfo> extends DecorateWithCQSProps<TContext, TInfo> {
  queries: any[];
  mutations: any[];
}

class CQServer<TContext, TInfo> {
  readonly app: Express = express();
  readonly cqs: DecorateWithCQSProps<TContext, TInfo>;
  readonly queries: QueryHandler[];
  readonly mutations: MutationHandler[];

  constructor(props: CQServerProps<TContext, TInfo>) {
    this.cqs = { args: props.args, context: props.context, info: props.info };
    this.queries = props.queries;
    this.mutations = props.mutations;
  }

  async handleQueries() {
    if (!this.queries.length) {
      throw new Error('No queries provided');
    }

    this.queries.forEach((queryHandler) => {
      queryHandler.handle(this.cqs);
      this.app.use(`/${queryHandler.resource}`, queryHandler.router);
    });
  }

  async handleMutations() {
    if (!this.mutations.length) {
      throw new Error('No mutations provided');
    }

    this.mutations.forEach((mutationHandler) => {
      mutationHandler.handle(this.cqs);
      this.app.use(`/${mutationHandler.resource}`, mutationHandler.router);
    });
  }

  async run() {
    // generator.init(
    //   this.app,
    //   function (spec) {
    //     // _.set(
    //     //   spec,
    //     //   'paths["/students/{name}"].get.parameters[0].description',
    //     //   'description of a parameter',
    //     // );
    //     return spec;
    //   },
    //   '../../test_spec.json',
    //   1000,
    //   'api-docs',
    //   ['Hello'],
    //   ['hello'],
    // );

    const middlewareHandler = new MiddlewareHandler(this.app);
    const errorHandler = new ErrorHandler(this.app);

    await middlewareHandler.useConfigMiddlewares();
    // this.app.use(decorateWithCQS(this.cqs));
    await this.handleQueries();
    await this.handleMutations();
    await errorHandler.handleErrors();
  }

  async listen() {
    await this.run();
    this.app
      .listen(port, () => {
        Logger.info(`server running on port : ${port}`);
      })
      .on('error', (e) => Logger.error(e));
  }
}

export default CQServer;
