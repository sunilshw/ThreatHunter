/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState } from 'react';
import { FormattedMessage } from '@kbn/i18n/react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiTab,
  EuiTabs,
  EuiSpacer,
} from '@elastic/eui';
import {
  UIM_TEMPLATE_DETAIL_PANEL_MAPPINGS_TAB,
  UIM_TEMPLATE_DETAIL_PANEL_SUMMARY_TAB,
  UIM_TEMPLATE_DETAIL_PANEL_SETTINGS_TAB,
  UIM_TEMPLATE_DETAIL_PANEL_ALIASES_TAB,
} from '../../../../../common/constants';
import { Template } from '../../../../../common/types';
import { DeleteTemplatesModal, SectionLoading, SectionError } from '../../../../components';
import { loadIndexTemplate } from '../../../../services/api';
import { trackUiMetric, METRIC_TYPE } from '../../../../services/track_ui_metric';
import { SummaryTab, MappingsTab, SettingsTab, AliasesTab } from './tabs';

interface Props {
  templateName: Template['name'];
  onClose: () => void;
  reload: () => Promise<void>;
}

const SUMMARY_TAB_ID = 'summary';
const MAPPINGS_TAB_ID = 'mappings';
const ALIASES_TAB_ID = 'aliases';
const SETTINGS_TAB_ID = 'settings';

const summaryTabData = {
  id: SUMMARY_TAB_ID,
  name: (
    <FormattedMessage id="xpack.idxMgmt.templateDetails.summaryTabTitle" defaultMessage="Summary" />
  ),
};

const settingsTabData = {
  id: SETTINGS_TAB_ID,
  name: (
    <FormattedMessage
      id="xpack.idxMgmt.templateDetails.settingsTabTitle"
      defaultMessage="Settings"
    />
  ),
};

const mappingsTabData = {
  id: MAPPINGS_TAB_ID,
  name: (
    <FormattedMessage
      id="xpack.idxMgmt.templateDetails.mappingsTabTitle"
      defaultMessage="Mappings"
    />
  ),
};

const aliasesTabData = {
  id: ALIASES_TAB_ID,
  name: (
    <FormattedMessage id="xpack.idxMgmt.templateDetails.aliasesTabTitle" defaultMessage="Aliases" />
  ),
};

const tabToComponentMap: {
  [key: string]: React.FunctionComponent<{ templateDetails: Template }>;
} = {
  [SUMMARY_TAB_ID]: SummaryTab,
  [SETTINGS_TAB_ID]: SettingsTab,
  [MAPPINGS_TAB_ID]: MappingsTab,
  [ALIASES_TAB_ID]: AliasesTab,
};

const tabToUiMetricMap: { [key: string]: string } = {
  [SUMMARY_TAB_ID]: UIM_TEMPLATE_DETAIL_PANEL_SUMMARY_TAB,
  [SETTINGS_TAB_ID]: UIM_TEMPLATE_DETAIL_PANEL_SETTINGS_TAB,
  [MAPPINGS_TAB_ID]: UIM_TEMPLATE_DETAIL_PANEL_MAPPINGS_TAB,
  [ALIASES_TAB_ID]: UIM_TEMPLATE_DETAIL_PANEL_ALIASES_TAB,
};

const hasEntries = (tabData: object) => {
  return tabData ? Object.entries(tabData).length > 0 : false;
};

export const TemplateDetails: React.FunctionComponent<Props> = ({
  templateName,
  onClose,
  reload,
}) => {
  const { error, data: templateDetails, isLoading } = loadIndexTemplate(templateName);

  const [templateToDelete, setTemplateToDelete] = useState<Array<Template['name']>>([]);
  const [activeTab, setActiveTab] = useState<string>(SUMMARY_TAB_ID);

  let content;

  if (isLoading) {
    content = (
      <SectionLoading>
        <FormattedMessage
          id="xpack.idxMgmt.templateDetails.loadingIndexTemplateDescription"
          defaultMessage="Loading index template…"
        />
      </SectionLoading>
    );
  } else if (error) {
    content = (
      <SectionError
        title={
          <FormattedMessage
            id="xpack.idxMgmt.templateDetails.loadingIndexTemplateErrorMessage"
            defaultMessage="Error loading index template"
          />
        }
        error={error}
        data-test-subj="sectionError"
      />
    );
  } else if (templateDetails) {
    const { settings, mappings, aliases } = templateDetails;

    const settingsTab = hasEntries(settings) ? [settingsTabData] : [];
    const mappingsTab = hasEntries(mappings) ? [mappingsTabData] : [];
    const aliasesTab = hasEntries(aliases) ? [aliasesTabData] : [];

    const optionalTabs = [...settingsTab, ...mappingsTab, ...aliasesTab];
    const tabs = optionalTabs.length > 0 ? [summaryTabData, ...optionalTabs] : [];

    if (tabs.length > 0) {
      const Content = tabToComponentMap[activeTab];

      content = (
        <Fragment>
          <EuiTabs>
            {tabs.map(tab => (
              <EuiTab
                onClick={() => {
                  trackUiMetric(METRIC_TYPE.CLICK, tabToUiMetricMap[tab.id]);
                  setActiveTab(tab.id);
                }}
                isSelected={tab.id === activeTab}
                key={tab.id}
                data-test-subj="tab"
              >
                {tab.name}
              </EuiTab>
            ))}
          </EuiTabs>

          <EuiSpacer size="l" />

          <Content templateDetails={templateDetails} />
        </Fragment>
      );
    } else {
      content = (
        <Fragment>
          <EuiTitle size="s">
            <h3 data-test-subj="summaryTitle">
              <FormattedMessage
                id="xpack.idxMgmt.templateDetails.summaryHeadingText"
                defaultMessage="Summary"
              />
            </h3>
          </EuiTitle>

          <EuiSpacer size="l" />

          <SummaryTab templateDetails={templateDetails} />
        </Fragment>
      );
    }
  }

  return (
    <Fragment>
      {templateToDelete.length ? (
        <DeleteTemplatesModal
          callback={data => {
            if (data && data.hasDeletedTemplates) {
              reload();
            }
            setTemplateToDelete([]);
            onClose();
          }}
          templatesToDelete={templateToDelete}
        />
      ) : null}

      <EuiFlyout
        onClose={onClose}
        data-test-subj="templateDetails"
        aria-labelledby="templateDetailsFlyoutTitle"
        size="m"
        maxWidth={400}
      >
        <EuiFlyoutHeader>
          <EuiTitle size="m">
            <h2 id="templateDetailsFlyoutTitle" data-test-subj="title">
              {templateName}
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>

        <EuiFlyoutBody data-test-subj="content">{content}</EuiFlyoutBody>

        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiButtonEmpty
                iconType="cross"
                flush="left"
                onClick={onClose}
                data-test-subj="closeDetailsButton"
              >
                <FormattedMessage
                  id="xpack.idxMgmt.templateDetails.closeButtonLabel"
                  defaultMessage="Close"
                />
              </EuiButtonEmpty>
            </EuiFlexItem>

            {templateDetails && (
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  color="danger"
                  onClick={setTemplateToDelete.bind(null, [templateName])}
                  data-test-subj="deleteTemplateButton"
                >
                  <FormattedMessage
                    id="xpack.idxMgmt.templateDetails.deleteButtonLabel"
                    defaultMessage="Delete"
                  />
                </EuiButtonEmpty>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    </Fragment>
  );
};
