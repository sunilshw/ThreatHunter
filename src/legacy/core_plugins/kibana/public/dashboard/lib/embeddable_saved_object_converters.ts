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
import { omit } from 'lodash';
import { DashboardPanelState } from 'plugins/dashboard_embeddable_container';
import chrome from 'ui/chrome';
import { SavedDashboardPanel } from '../types';

export function convertSavedDashboardPanelToPanelState(
  savedDashboardPanel: SavedDashboardPanel,
  useMargins: boolean
): DashboardPanelState {
  return {
    type: savedDashboardPanel.type,
    gridData: savedDashboardPanel.gridData,
    ...(savedDashboardPanel.id !== undefined && { savedObjectId: savedDashboardPanel.id }),
    explicitInput: {
      id: savedDashboardPanel.panelIndex,
      ...(savedDashboardPanel.title !== undefined && { title: savedDashboardPanel.title }),
      ...savedDashboardPanel.embeddableConfig,
    },
  };
}

export function convertPanelStateToSavedDashboardPanel(
  panelState: DashboardPanelState
): SavedDashboardPanel {
  const customTitle: string | undefined = panelState.explicitInput.title
    ? (panelState.explicitInput.title as string)
    : undefined;
  return {
    version: chrome.getKibanaVersion(),
    type: panelState.type,
    gridData: panelState.gridData,
    panelIndex: panelState.explicitInput.id,
    embeddableConfig: omit(panelState.explicitInput, 'id'),
    ...(customTitle && { title: customTitle }),
    ...(panelState.savedObjectId !== undefined && { id: panelState.savedObjectId }),
  };
}
