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

import { i18n } from '@kbn/i18n';
import { TUTORIAL_CATEGORY } from '../../../common/tutorials/tutorial_category';
import {
  onPremInstructions,
  cloudInstructions,
  onPremCloudInstructions,
} from '../../../common/tutorials/filebeat_instructions';

export function suricataLogsSpecProvider(server, context) {
  const moduleName = 'suricata';
  const platforms = ['OSX', 'DEB', 'RPM', 'WINDOWS'];
  return {
    id: 'suricataLogs',
    name: i18n.translate('kbn.server.tutorials.suricataLogs.nameTitle', {
      defaultMessage: 'Suricata logs',
    }),
    category: TUTORIAL_CATEGORY.SIEM,
    shortDescription: i18n.translate('kbn.server.tutorials.suricataLogs.shortDescription', {
      defaultMessage: 'Collect the result logs created by Suricata IDS/IPS/NSM.',
    }),
    longDescription: i18n.translate('kbn.server.tutorials.suricataLogs.longDescription', {
      defaultMessage:
        'The `suricata` Filebeat module collects the logs from the \
[Suricata Eve JSON output](https://suricata.readthedocs.io/en/latest/output/eve/eve-json-format.html). \
[Learn more]({learnMoreLink}).',
      values: {
        learnMoreLink: '{config.docs.beats.filebeat}/filebeat-module-suricata.html',
      },
    }),
    //euiIconType: 'logoSuricata',
    artifacts: {
      dashboards: [
        {
          id: '69f5ae20-eb02-11e7-8f04-51231daa5b05',
          linkLabel: i18n.translate(
            'kbn.server.tutorials.suricataLogs.artifacts.dashboards.linkLabel',
            {
              defaultMessage: 'Suricata logs dashboard',
            }
          ),
          isOverview: true,
        },
      ],
      exportedFields: {
        documentationUrl: '{config.docs.beats.filebeat}/exported-fields-suricata.html',
      },
    },
    completionTimeMinutes: 10,
    previewImagePath: '/plugins/kibana/home/tutorial_resources/suricata_logs/screenshot.png',
    onPrem: onPremInstructions(moduleName, platforms, context),
    elasticCloud: cloudInstructions(moduleName, platforms),
    onPremElasticCloud: onPremCloudInstructions(moduleName, platforms),
  };
}
