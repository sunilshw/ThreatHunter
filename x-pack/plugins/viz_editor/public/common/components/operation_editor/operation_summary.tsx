/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { FunctionComponent } from 'react';

import { EuiIcon, IconType } from '@elastic/eui';

export interface OperationSummaryProps {
  iconType?: IconType;
  operation?: string;
  field?: string;
}

export const OperationSummary: FunctionComponent<OperationSummaryProps> = ({
  iconType,
  operation,
  field,
}) => {
  let title: string = '';

  let iconNode;
  if (iconType) {
    iconNode = <EuiIcon type={iconType} className="lnsConfigPanel__summaryIcon" />;
  }

  let operationNode;
  if (operation) {
    operationNode = (
      <>
        <strong className="lnsConfigPanel__summaryOperation">{operation}</strong> of{' '}
      </>
    );
    title += `${operation} of `;
  }

  let fieldNode;
  if (field) {
    fieldNode = <strong className="lnsConfigPanel__summaryField">{field}</strong>;
    title += `${field}`;
  }

  return (
    <>
      {iconNode}
      <span title={title}>
        {operationNode}
        {fieldNode}
      </span>
    </>
  );
};
