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

import 'ngreact';
import { wrapInI18nContext } from 'ui/i18n';
import { uiModules } from 'ui/modules';
import { SearchBar } from '../components';

const app = uiModules.get('app/data', ['react']);

export function setupDirective() {
  app.directive('searchBar', (reactDirective, localStorage) => {
    return reactDirective(
      wrapInI18nContext(SearchBar),
      [
        ['query', { watchDepth: 'reference' }],
        ['savedQuery', { watchDepth: 'reference' }],
        ['store', { watchDepth: 'reference' }],
        ['intl', { watchDepth: 'reference' }],

        ['onQuerySubmit', { watchDepth: 'reference' }],
        ['onFiltersUpdated', { watchDepth: 'reference' }],
        ['onRefreshChange', { watchDepth: 'reference' }],
        ['onSaved', { watchDepth: 'reference' }],
        ['onSavedQueryUpdated', { watchDepth: 'reference' }],
        ['onClearSavedQuery', { watchDepth: 'reference' }],

        ['indexPatterns', { watchDepth: 'collection' }],
        ['filters', { watchDepth: 'collection' }],

        'appName',
        'screenTitle',
        'showFilterBar',
        'showQueryBar',
        'showDatePicker',
        'dateRangeFrom',
        'dateRangeTo',
        'isRefreshPaused',
        'refreshInterval',
        'disableAutoFocus',
        'showAutoRefreshOnly',
      ],
      {},
      {
        store: localStorage,
      },
    );
  });
}
