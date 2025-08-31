import { INode, INodeBasic, INodeDetail, NodeLink, CatalogType, IExecuteOptions, IconName } from '@repo/common';
import config from "./node.json"
import amapWeather from "./AmapWeather";

export class AmapWeather implements INode {
    node: INodeBasic = {
        kind: config.kind,
        name: config.name,
        catalog: config.catalog as CatalogType,
        version: config.version,
        description: config.description,
        icon: config.icon as IconName
    };
    detail: INodeDetail = {
        // displayName: config.displayName,
        // name: config.name,
        // group: config.group as NodeGroupType[],
        // subtitle: config.subtitle,
        // description: config.description,
        // inputs: [NodeConnectionTypes.Main],
        // outputs: [NodeConnectionTypes.Main],
        fields: [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                default: '',
                required: true,
                placeholder: '',
                description:
                    'Amap Weather API using a simple API key.',
                controlType: 'input'
            },
            {
                displayName: 'City Code',
                name: 'cityCode',
                type: 'string',
                default: "",
                required: true,
                placeholder: '',
                description:
                    'City code for query',
                controlType: 'input'
            },
        ],
    };

    async execute(opts: IExecuteOptions): Promise<string> {
        const inputs = opts?.inputs;
        return await amapWeather({
            apiKey: inputs?.apiKey,
            cityCode: inputs?.cityCode,
            extensions: inputs?.extensions,
        })
    }
}
