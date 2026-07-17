import type { ComponentType, SVGProps } from 'react';
import {
    CodeBracketIcon,
    PaintBrushIcon,
    BookOpenIcon,
    CubeIcon,
} from '@heroicons/react/24/outline';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, IconType> = {
    'code-bracket': CodeBracketIcon,
    'paint-brush': PaintBrushIcon,
    'book-open': BookOpenIcon,
    cube: CubeIcon,
};

interface ModuleIconProps {
    name: string;
    className?: string;
}

/** Resolve a module's icon name (from JSON) to a Heroicon component. */
export function ModuleIcon({ name, className }: ModuleIconProps) {
    const Icon = ICONS[name] ?? BookOpenIcon;
    return <Icon className={className} />;
}
