import { PaginationParams } from './paginationParams';
export class LikesParams extends PaginationParams{
  predicate = 'liked';
  constructor(){
    super();
  }
}
