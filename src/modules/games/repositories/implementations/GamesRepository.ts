import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return await this.repository
      .createQueryBuilder("games")
      .where(`LOWER(title) LIKE '%${param.toLowerCase()}%'`)
      .getMany()
  }

  async countAllGames(): Promise<[{ count: string }]> {
    return this.repository.query(
      "SELECT COUNT(id) FROM games"
    );
  }

  async findUsersByGameId(id: string): Promise<User[]> {    
    const query = await this.repository
    .createQueryBuilder('games')
    .innerJoinAndMapMany('games.users', 'games.users', 'users')
    .where('games.id = :id', { id })
    .select(['games.title', 'users'])
    .getOne();
    
    if(!query){
      throw new Error('Invalid game ID!')
    }

    return query.users
  }
}
