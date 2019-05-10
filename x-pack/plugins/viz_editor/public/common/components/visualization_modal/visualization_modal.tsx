/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiFacetButton,
  EuiFacetGroup,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiFlexItem,
  EuiModal,
  EuiTitle,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiPanel,
  EuiSpacer,
} from '@elastic/eui';
import React, { useState } from 'react';
import { Suggestion } from '../../../editor_plugin_registry';
import { ExpressionRenderer } from '../../../frame/expression_renderer';
import { VisModel } from '../../lib';

interface VisualizationModalProps {
  title: string;
  onClose: () => void;
  onSelect: (newVisModel: VisModel) => void;
  suggestions: Suggestion[];
  getInterpreter: () => Promise<{ interpreter: any }>;
  renderersRegistry: { get: (renderer: string) => any };
}

export function VisualizationModal({
  suggestions,
  title,
  onClose,
  onSelect,
  getInterpreter,
  renderersRegistry,
}: VisualizationModalProps) {
  const suggestionCategoryMap = suggestions.reduce(
    (categoryMap, suggestion) => ({
      ...categoryMap,
      [suggestion.category]: [...(categoryMap[suggestion.category] || []), suggestion],
    }),
    {} as {
      [category: string]: Suggestion[];
    }
  );
  const [filter, setFilter] = useState<string | null>(null);

  return (
    <>
      <EuiOverlayMask>
        <EuiModal
          className="lnsVisualizationModal"
          onClose={onClose}
          initialFocus="[name=popswitch]"
          maxWidth="75vw"
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>{title}</EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiFlexGroup gutterSize="none" className="lnsVisualizationModal__body">
            <EuiFlexItem grow={false} className="lnsVisualizationModal__facetsHolder">
              <EuiFacetGroup>
                <EuiFacetButton
                  onClick={() => {
                    setFilter(null);
                  }}
                  buttonRef={null as any}
                  quantity={suggestions.length}
                  isSelected={!filter}
                >
                  All Suggestions
                </EuiFacetButton>
                <EuiSpacer size="m" />
                {Object.entries(suggestionCategoryMap).map(([category, categorySuggestions]) => (
                  <EuiFacetButton
                    key={category}
                    onClick={() => {
                      setFilter(category);
                    }}
                    buttonRef={null as any}
                    quantity={categorySuggestions.length}
                    isSelected={filter === category}
                  >
                    {category === 'line' ? 'XY chart' : category}
                  </EuiFacetButton>
                ))}
              </EuiFacetGroup>
            </EuiFlexItem>
            <EuiFlexItem className="lnsVisualizationModal__suggestions">
              <EuiFlexGrid columns={3}>
                {(filter ? suggestionCategoryMap[filter] : suggestions).map(suggestion => (
                  <EuiFlexItem key={suggestion.title} grow={true}>
                    <EuiPanel
                      className="lnsVisualizationModal__suggestion"
                      onClick={() => onSelect(suggestion.visModel)}
                      paddingSize="s"
                    >
                      <span>
                        <EuiTitle size="xxxs" className="lnsVisualizationModal__suggestionTitle">
                          <span>{suggestion.title}</span>
                        </EuiTitle>
                        <ExpressionRenderer
                          getInterpreter={getInterpreter}
                          renderersRegistry={renderersRegistry}
                          expression={suggestion.previewExpression}
                          size="preview"
                        />
                      </span>
                    </EuiPanel>
                  </EuiFlexItem>
                ))}
              </EuiFlexGrid>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiModal>
      </EuiOverlayMask>
    </>
  );
}
