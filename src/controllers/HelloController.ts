import { Controller, Get, Use } from '../packages/core/decorators';
import { SuccessResponse } from '../packages/core/exceptions';
import { GetHelloQuery } from '../modules/hello/queries/GetHelloQuery';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { MemMediator } from '../packages/mem-events';
import { tryMiddleware } from '../middlewares';

@injectable()
@Use(tryMiddleware)
@Controller('hello')
class HelloController {
  @inject(MemMediator) private _mediator: MemMediator;

  @Get('gigi')
  public async getHello(req: Request, res: Response): Promise<SuccessResponse<any>> {
    const result = await this._mediator.send(new GetHelloQuery({ type: 1 }));
    return new SuccessResponse('success', result);
  }
}

export default HelloController;
