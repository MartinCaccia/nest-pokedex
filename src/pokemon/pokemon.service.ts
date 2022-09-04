import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      const newPokemon = await this.pokemonModel.create(createPokemonDto);
      return newPokemon;
    } catch (error) {
      this.handleExceptions(error, 'create');
    }
  }

  async findAll() {
    const allPokemons = await this.pokemonModel.find();
    return allPokemons;
  }

  async findOne(id: string) {
    let pokemon: Pokemon;
    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({
        nro: id,
      });
    }
    if (!pokemon && isValidObjectId(id)) {
      pokemon = await this.pokemonModel.findById(id);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: id,
      });
    }
    if (!pokemon) throw new NotFoundException(`Pokemon with ${id} not found`);
    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);
    try {
      await pokemon.updateOne(updatePokemonDto);
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error, 'update');
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    try {
      // await pokemon.deleteOne();
      const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
      if (deletedCount === 0)
        throw new BadRequestException(`Pokemon with id ${id} not found`);
      return `Pokemon #${id} removed`;
    } catch (error) {
      this.handleExceptions(error, 'remove');
    }
  }

  private handleExceptions(error: any, action?: string) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already existis in db: ${error.message} `,
      );
    } else {
      throw new InternalServerErrorException(
        `Can't ${action} Pokemon, ${error.message}`,
      );
    }
  }
}
