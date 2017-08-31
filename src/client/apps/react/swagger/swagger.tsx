
import * as React from 'react';
import {Spec, Operation, Parameter, Response} from 'swagger-schema-official';
import styled from 'styled-components';

function renderParameter(parameters: Parameter[]) {
    if (!parameters || parameters.length === 0) return <p>no parameters</p>;
    return (
        <table>
            <thead>
                <th>name</th>
                <th>description</th>
            </thead>
            <tbody>
                {parameters.map((p, i) => {
                    return (
                        <tr key={i}>
                            <td>{p.name}</td>
                            <td>{p.description}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

function renderResponses(responses: { [responseName: string]: Response }) {
    if (!responses) return <p>no responses</p>;
    return (
        <ul>
        {Object.keys(responses).map((code, i) => {
            const responseInfo = responses[code];
            return (
                <li key={i}>
                    <p>{responseInfo.description}</p>
                    {responseInfo.examples && (
                        <ul>
                            {Object.keys(responseInfo.examples).map((responseType, i) => {
                                return (
                                    <li key={i}>
                                        <p>{responseType}</p>
                                        <pre><code>
                                            {responseInfo.examples[responseType]}
                                        </code></pre>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </li>
            );
        })}
        </ul>
    );
}

export class Swagger extends React.Component<{
    className?: string;
    spec: Spec;
}, {}> {

    render() {
        const {
            className,
            spec,
        } = this.props;
        return (
            <div className={className}>
                <h1>{spec.info.title}</h1>
                {Object.keys(spec.paths).map((path, i) => {
                    const pathInfo = spec.paths[path];
                    return (
                        <article key={i}>
                            <h2>{path}</h2>
                            {Object.keys(pathInfo).map((method, i) => {
                                const operation: Operation = pathInfo[method];
                                return (
                                    <div key={i} className={`opblock opblock-${method}`}>
                                        <div className={`opblock-summary opblock-summary-${method}`}>
                                            <span className='opblock-summary-method'>{method}</span>
                                            <span className='opblock-summary-path'>{path}</span>
                                            <span className='opblock-summary-description'>{operation.summary}</span>
                                            <p>{operation.description}</p>
                                        </div>
                                        {renderParameter(operation.parameters)}
                                        {renderResponses(operation.responses)}
                                    </div>
                                );
                            })}
                        </article>
                    );
                })}
            </div>
        );
    }
}

function method($color) {
    return `
    border-color: ${$color};
    background: rgba(${$color}, .1);

    .opblock-summary-method
    {
        background: ${$color};
    }

    .opblock-summary
    {
        border-color: ${$color};
    }

    .tab-header .tab-item.active h4 span:after
    {
        background: ${$color};
    }
    `;
}

export const StyledSwagger = styled(Swagger)`
    .opblock {

        margin: 0 0 15px;
        border: 1px solid #000;
        border-radius: 4px;
        box-shadow: 0 0 3px rgba(0,0,0,.19);

        &-get {
            border-color: #61affe;
            background: rgba(97,175,254,.1);
        }

        &-summary {
            display: flex;
            align-items: center;
            padding: 5px;
            cursor: pointer;

            &-method {
                font-size: 14px;
                font-weight: 700;
                min-width: 80px;
                padding: 6px 15px;
                text-align: center;
                border-radius: 3px;
                background: #000;
                text-shadow: 0 1px 0 rgba(0,0,0,.1);
                font-family: Titillium Web,sans-serif;
                color: #fff;
            }

            &-path {

            }

            &-get {
                ${method('#61affe')}
            }
        }
    }

    .opblock-summary-path,
    .opblock-summary-operation-id,
    .opblock-summary-path__deprecated
    {
        font-size: 16px;

        display: flex;
        align-items: center;

        padding: 0 10px;

        @include text_code();

        .view-line-link
        {
            position: relative;
            top: 2px;

            width: 0;
            margin: 0;

            cursor: pointer;
            transition: all .5s;
        }

        &:hover
        {
            .view-line-link
            {
                width: 18px;
                margin: 0 5px;
            }
        }
    }
`;