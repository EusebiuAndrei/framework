import { post, schema, use } from '../../../core/decorators';
import { SuccessResponse } from '../../../core/api/ApiResponse';
import MutationHandler from '../../../core/@cqs/MutationHandler';
import bodyParser from 'body-parser';
import { userId, UserId, Post } from '../schema';

class HelloMutation extends MutationHandler {
  public resource = 'hello';

  constructor() {
    super();
  }

  // Full decorators usage example
  @post('') // <=> @method('post') @path('/hello')
  @use([bodyParser.json({ limit: '10mb' })])
  @schema(Post)
  public getHello(args: any, ctx: any, info: any): any {
    return new SuccessResponse('success', { args, ctx });
  }
}

export default HelloMutation;
