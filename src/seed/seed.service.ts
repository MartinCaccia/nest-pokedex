import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  private readonly axios: AxiosInstance = axios;

  async seedExecuted() {
    await this.pokemonModel.deleteMany(); //deleteAll
    const { data } = await this.axios.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=100',
    );
    const dataToInsert: { name: string; nro: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const nro = +segments[segments.length - 2];
      // console.log({ name, nro });
      dataToInsert.push({ name, nro });
    });
    // console.log(dataToInsert);
    // const newPokemons = await this.pokemonModel.create(dataToInsert);
    const newPokemons = await this.pokemonModel.insertMany(dataToInsert);
    return newPokemons;
  }
}
