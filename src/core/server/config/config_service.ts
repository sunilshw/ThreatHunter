/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Type } from '@kbn/config-schema';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { distinctUntilChanged, first, map } from 'rxjs/operators';

import { Config, ConfigPath, Env } from '.';
import { Logger, LoggerFactory } from '../logging';
import { hasConfigPathIntersection } from './config';

/** @internal */
export class ConfigService {
  private readonly log: Logger;

  /**
   * Whenever a config if read at a path, we mark that path as 'handled'. We can
   * then list all unhandled config paths when the startup process is completed.
   */
  private readonly handledPaths: ConfigPath[] = [];
  private readonly schemas = new Map<string, Type<unknown>>();

  constructor(
    private readonly config$: Observable<Config>,
    private readonly env: Env,
    logger: LoggerFactory
  ) {
    this.log = logger.get('config');
  }

  /**
   * Set config schema for a path and performs its validation
   */
  public async setSchema(path: ConfigPath, schema: Type<unknown>) {
    const namespace = pathToString(path);
    if (this.schemas.has(namespace)) {
      throw new Error(`Validation schema for ${path} was already registered.`);
    }

    this.schemas.set(namespace, schema);

    await this.validateConfig(path)
      .pipe(first())
      .toPromise();
  }

  /**
   * Returns the full config object observable. This is not intended for
   * "normal use", but for features that _need_ access to the full object.
   */
  public getConfig$() {
    return this.config$;
  }

  /**
   * Reads the subset of the config at the specified `path` and validates it
   * against the static `schema` on the given `ConfigClass`.
   *
   * @param path - The path to the desired subset of the config.
   */
  public atPath<TSchema>(path: ConfigPath) {
    return this.validateConfig(path) as Observable<TSchema>;
  }

  /**
   * Same as `atPath`, but returns `undefined` if there is no config at the
   * specified path.
   *
   * {@link ConfigService.atPath}
   */
  public optionalAtPath<TSchema>(path: ConfigPath) {
    return this.getDistinctConfig(path).pipe(
      map(config => {
        if (config === undefined) return undefined;
        return this.validate(path, config) as TSchema;
      })
    );
  }

  public async isEnabledAtPath(path: ConfigPath) {
    const enabledPath = createPluginEnabledPath(path);

    const config = await this.config$.pipe(first()).toPromise();
    if (!config.has(enabledPath)) {
      return true;
    }

    const isEnabled = config.get(enabledPath);
    if (isEnabled === false) {
      // If the plugin is _not_ enabled, we mark the entire plugin path as
      // handled, as it's expected that it won't be used.
      this.markAsHandled(path);
      return false;
    }

    // If plugin enabled we mark the enabled path as handled, as we for example
    // can have plugins that don't have _any_ config except for this field, and
    // therefore have no reason to try to get the config.
    this.markAsHandled(enabledPath);
    return true;
  }

  public async getUnusedPaths() {
    const config = await this.config$.pipe(first()).toPromise();
    const handledPaths = this.handledPaths.map(pathToString);

    return config.getFlattenedPaths().filter(path => !isPathHandled(path, handledPaths));
  }

  public async getUsedPaths() {
    const config = await this.config$.pipe(first()).toPromise();
    const handledPaths = this.handledPaths.map(pathToString);

    return config.getFlattenedPaths().filter(path => isPathHandled(path, handledPaths));
  }

  private validate(path: ConfigPath, config: Record<string, unknown>) {
    const namespace = pathToString(path);
    const schema = this.schemas.get(namespace);
    if (!schema) {
      throw new Error(`No validation schema has been defined for ${namespace}`);
    }
    return schema.validate(
      config,
      {
        dev: this.env.mode.dev,
        prod: this.env.mode.prod,
        ...this.env.packageInfo,
      },
      namespace
    );
  }

  private validateConfig(path: ConfigPath) {
    return this.getDistinctConfig(path).pipe(map(config => this.validate(path, config)));
  }

  private getDistinctConfig(path: ConfigPath) {
    this.markAsHandled(path);

    return this.config$.pipe(
      map(config => config.get(path)),
      distinctUntilChanged(isEqual)
    );
  }

  private markAsHandled(path: ConfigPath) {
    this.log.debug(`Marking config path as handled: ${path}`);
    this.handledPaths.push(path);
  }
}

const createPluginEnabledPath = (configPath: string | string[]) => {
  if (Array.isArray(configPath)) {
    return configPath.concat('enabled');
  }
  return `${configPath}.enabled`;
};

const pathToString = (path: ConfigPath) => (Array.isArray(path) ? path.join('.') : path);

/**
 * A path is considered 'handled' if it is a subset of any of the already
 * handled paths.
 */
const isPathHandled = (path: string, handledPaths: string[]) =>
  handledPaths.some(handledPath => hasConfigPathIntersection(path, handledPath));
