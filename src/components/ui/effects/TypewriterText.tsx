import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
	texts: string[];
	speed?: number;
	delay?: number;
	className?: string;
	cursorClassName?: string;
}

const TypewriterText = ({
	texts,
	speed = 100,
	delay = 2000,
	className,
	cursorClassName
}: TypewriterTextProps) => {
	const [currentTextIndex, setCurrentTextIndex] = useState(0);
	const [currentText, setCurrentText] = useState('');
	const [isDeleting, setIsDeleting] = useState(false);
	const [isWaiting, setIsWaiting] = useState(false);

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (isWaiting) {
			timeout = setTimeout(() => {
				setIsWaiting(false);
				setIsDeleting(true);
			}, delay);
			return () => clearTimeout(timeout);
		}

		const handleType = () => {
			const fullText = texts[currentTextIndex];

			if (isDeleting) {
				setCurrentText(fullText.substring(0, currentText.length - 1));
				if (currentText.length === 0) {
					setIsDeleting(false);
					setCurrentTextIndex((prev) => (prev + 1) % texts.length);
				}
			} else {
				setCurrentText(fullText.substring(0, currentText.length + 1));
				if (currentText.length === fullText.length) {
					setIsWaiting(true);
				}
			}
		};

		const typingSpeed = isDeleting ? speed / 2 : speed;
		timeout = setTimeout(handleType, typingSpeed);

		return () => clearTimeout(timeout);
	}, [currentText, isDeleting, isWaiting, currentTextIndex, texts, speed, delay]);

	return (
		<span className={cn("inline-flex items-center", className)}>
			<span>{currentText}</span>
			<span className={cn("ml-1 animate-pulse border-r-2 border-primary h-[1.2em]", cursorClassName)} />
		</span>
	);
};

export default TypewriterText;
