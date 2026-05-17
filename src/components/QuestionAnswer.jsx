import { memo } from 'react';

const QuestionAnswer = ({ item, Answer, index }) => {
  return (
    <>
      <li
        key={index}
        className={`flex ${item.type === "q"
          ? "justify-end"
          : "justify-start"
          } mb-2`}>
        {item.type === "q" ? (
          <div className="text-right p-2 dark:bg-zinc-700 dark:border-b-zinc-700 bg-red-100 border-red-100 rounded-tl-3xl rounded-br-3xl rounded-bl-3xl max-w-xs">
            <Answer ans={item.text} totalResult={1} index={index} type={item.type} />
          </div>
        ) : (
          <div className="text-left p-2 bg-zinc-600 rounded-tr-3xl rounded-bl-3xl rounded-br-3xl max-w-xs">
            {item.text.map((ansItem, ansIndex) => (
              <Answer key={ansIndex} ans={ansItem} totalResult={item.text.length} index={ansIndex} />
            ))}
          </div>
        )}
      </li>
    </>
  );
};

export default QuestionAnswer;