import { classes } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { controllerModules } from '@Controllers/index';
import { servicesModules } from '@Services/index';
import { MongooseModule } from '@nestjs/mongoose';
import { dataModules } from './data';
import { getEnvPath } from './common/helper/env.helper';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const envFilePath: string = getEnvPath(`${__dirname.split('dist')[0]}src/common/envs`);
const envPath = `${__dirname.split('dist')[0]}src/common/envs` + '/.env';
const config: ConfigService = new ConfigService();
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [envFilePath, envPath],
      isGlobal: true,
    }),
    MongooseModule.forRoot(`mongodb://127.0.0.1:27017/saas_db`),
    HttpModule,
    JwtModule.register({ secret: 'yOUjr4bRjjDrakKrCpO74IWX5DT348Jf' }),
    AutomapperModule.forRoot({ strategyInitializer: classes() }),
    ...controllerModules,
    ...servicesModules,
    ...dataModules,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    console.log(config.get('DATABASE_NAME'), config.get('TEST'), '\n', __dirname);
  }
}
