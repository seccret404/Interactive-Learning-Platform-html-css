import type { Question } from '@/types';
import { MultipleChoiceView } from './MultipleChoiceView';
import { IdentifyView } from './IdentifyView';
import { FillCodeView } from './FillCodeView';
import { EditorView } from './EditorView';

interface Props {
    question: Question;
    moduleId: string;
    subModuleId: number;
    index: number;
    passed: boolean;
    onPass: () => void;
}

/** Renders the right question component for the current question type. */
export function QuestionView({ question, ...rest }: Props) {
    switch (question.type) {
        case 'multiple_choice':
            return <MultipleChoiceView question={question} {...rest} />;
        case 'identify':
            return <IdentifyView question={question} {...rest} />;
        case 'fill_code':
            return <FillCodeView question={question} {...rest} />;
        case 'editor':
            return <EditorView question={question} {...rest} />;
        default:
            return null;
    }
}
