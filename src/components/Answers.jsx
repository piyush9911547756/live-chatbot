import React, { useEffect, useState } from "react";
import { checkHeading, replaceHeadingStarts } from "../helper";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown'

const Answer = ({ ans, totalResult, index, type }) => {


    const [heading, setheading] = useState(false)
    const [answer, setAnswer] = useState(ans)

    useEffect(() => {
        if (checkHeading(ans)) {
            setheading(true)
            setAnswer(replaceHeadingStarts(ans))
        }
    }, [])

    const renderer = {
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    language={match[1]}
                    style={dark}
                    PreTag="div"
                />
            ) : (
                <code {...props} className={className}>
                    {children}
                </code>
            )
        }
    }
    return (
        <>
            {
                index && totalResult > 1 ? <span className=" pt-2  text-lg block text-white">{answer}</span> :
                    heading ? <span className={"pt-2  text-lg block text-white"}>{answer}</span> :
                        <span className={type == 'q' ? 'pl-1' : 'pl-5'}>
                            <ReactMarkdown components={renderer}>{answer}</ReactMarkdown>
                        </span>
            }
        </>
    )
}
export default Answer