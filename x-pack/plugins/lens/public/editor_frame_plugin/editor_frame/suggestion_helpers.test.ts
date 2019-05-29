/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getSuggestions } from './suggestion_helpers';
import { createMockVisualization } from '../mock_extensions';
import { TableColumn } from '../../types';

describe('suggestion helpers', () => {
  it('should return suggestions array', () => {
    const mockVisualization = createMockVisualization();
    const suggestedState = {};
    const suggestions = getSuggestions(
      [{ state: {}, tableColumns: [] }],
      {
        vis1: {
          ...mockVisualization,
          getSuggestions: () => [
            { tableIndex: 0, score: 0.5, title: 'Test', state: suggestedState },
          ],
        },
      },
      'vis1',
      {}
    );
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].state).toBe(suggestedState);
  });

  it('should concatenate suggestions from all visualizations', () => {
    const mockVisualization1 = createMockVisualization();
    const mockVisualization2 = createMockVisualization();
    const suggestions = getSuggestions(
      [{ state: {}, tableColumns: [] }],
      {
        vis1: {
          ...mockVisualization1,
          getSuggestions: () => [
            { tableIndex: 0, score: 0.5, title: 'Test', state: {} },
            { tableIndex: 0, score: 0.5, title: 'Test2', state: {} },
          ],
        },
        vis2: {
          ...mockVisualization2,
          getSuggestions: () => [{ tableIndex: 0, score: 0.5, title: 'Test3', state: {} }],
        },
      },
      'vis1',
      {}
    );
    expect(suggestions.length).toBe(3);
  });

  it('should rank the visualizations by score', () => {
    const mockVisualization1 = createMockVisualization();
    const mockVisualization2 = createMockVisualization();
    const suggestions = getSuggestions(
      [{ state: {}, tableColumns: [] }],
      {
        vis1: {
          ...mockVisualization1,
          getSuggestions: () => [
            { tableIndex: 0, score: 0.2, title: 'Test', state: {} },
            { tableIndex: 0, score: 0.8, title: 'Test2', state: {} },
          ],
        },
        vis2: {
          ...mockVisualization2,
          getSuggestions: () => [{ tableIndex: 0, score: 0.6, title: 'Test3', state: {} }],
        },
      },
      'vis1',
      {}
    );
    expect(suggestions[0].score).toBe(0.8);
    expect(suggestions[1].score).toBe(0.6);
    expect(suggestions[2].score).toBe(0.2);
  });

  it('should call all suggestion getters with all available data tables', () => {
    const mockVisualization1 = createMockVisualization();
    const mockVisualization2 = createMockVisualization();
    const table1: TableColumn[] = [];
    const table2: TableColumn[] = [];
    getSuggestions(
      [{ state: {}, tableColumns: table1 }, { state: {}, tableColumns: table2 }],
      {
        vis1: mockVisualization1,
        vis2: mockVisualization2,
      },
      'vis1',
      {}
    );
    expect(mockVisualization1.getSuggestions.mock.calls[0][0].tables[0]).toBe(table1);
    expect(mockVisualization1.getSuggestions.mock.calls[0][0].tables[1]).toBe(table2);
    expect(mockVisualization2.getSuggestions.mock.calls[0][0].tables[0]).toBe(table1);
    expect(mockVisualization2.getSuggestions.mock.calls[0][0].tables[1]).toBe(table2);
  });

  it('should map the suggestion ids back to the correct datasource states', () => {
    const mockVisualization1 = createMockVisualization();
    const mockVisualization2 = createMockVisualization();
    const tableState1 = {};
    const tableState2 = {};
    const suggestions = getSuggestions(
      [{ state: tableState1, tableColumns: [] }, { state: tableState2, tableColumns: [] }],
      {
        vis1: {
          ...mockVisualization1,
          getSuggestions: () => [
            { tableIndex: 0, score: 0.3, title: 'Test', state: {} },
            { tableIndex: 1, score: 0.2, title: 'Test2', state: {} },
          ],
        },
        vis2: {
          ...mockVisualization2,
          getSuggestions: () => [{ tableIndex: 1, score: 0.1, title: 'Test3', state: {} }],
        },
      },
      'vis1',
      {}
    );
    expect(suggestions[0].datasourceState).toBe(tableState1);
    expect(suggestions[1].datasourceState).toBe(tableState2);
    expect(suggestions[1].datasourceState).toBe(tableState2);
  });

  it('should pass the state of the currently active visualization to getSuggestions', () => {
    const mockVisualization1 = createMockVisualization();
    const mockVisualization2 = createMockVisualization();
    const currentState = {};
    getSuggestions(
      [{ state: {}, tableColumns: [] }, { state: {}, tableColumns: [] }],
      {
        vis1: mockVisualization1,
        vis2: mockVisualization2,
      },
      'vis1',
      currentState
    );
    expect(mockVisualization1.getSuggestions).toHaveBeenCalledWith(
      expect.objectContaining({
        state: currentState,
      })
    );
    expect(mockVisualization2.getSuggestions).not.toHaveBeenCalledWith(
      expect.objectContaining({
        state: currentState,
      })
    );
  });
});