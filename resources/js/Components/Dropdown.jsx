import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const DropDownContext = createContext();

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen, triggerRef }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen, triggerRef } = useContext(DropDownContext);

    return (
        <>
            <div ref={triggerRef} onClick={toggleOpen}>
                {children}
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}) => {
    const { open, setOpen, triggerRef } = useContext(DropDownContext);
    const contentRef = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const computeCoords = () => {
        const trigger = triggerRef.current;
        const content = contentRef.current;
        if (!trigger) {
            return;
        }

        const triggerRect = trigger.getBoundingClientRect();
        const contentRect = content?.getBoundingClientRect();
        const menuWidth = contentRect?.width || (width === '48' ? 192 : triggerRect.width);
        const menuHeight = contentRect?.height || 0;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const gap = 8;

        let left =
            align === 'left'
                ? triggerRect.left
                : triggerRect.right - menuWidth;

        if (left + menuWidth > viewportWidth - gap) {
            left = viewportWidth - menuWidth - gap;
        }
        if (left < gap) {
            left = gap;
        }

        let top = triggerRect.bottom + gap;
        if (top + menuHeight > viewportHeight - gap && menuHeight > 0) {
            top = Math.max(gap, triggerRect.top - menuHeight - gap);
        }

        setCoords({
            top,
            left,
            width: width === '48' ? 192 : triggerRect.width,
        });
    };

    useLayoutEffect(() => {
        if (!open) {
            return;
        }

        computeCoords();
        const id = requestAnimationFrame(computeCoords);

        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, align, width, children]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleReposition = () => computeCoords();

        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);

        return () => {
            window.removeEventListener('resize', handleReposition);
            window.removeEventListener('scroll', handleReposition, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, align, width]);

    return createPortal(
        <div className="fixed inset-0 z-50 pointer-events-none">
            <Transition
                show={open}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div
                    ref={contentRef}
                    className="pointer-events-auto fixed origin-top-right rounded-md shadow-lg"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                    }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        className={
                            `rounded-md ring-1 ring-black ring-opacity-5 ` +
                            contentClasses
                        }
                    >
                        {children}
                    </div>
                </div>
            </Transition>
        </div>,
        document.body,
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
