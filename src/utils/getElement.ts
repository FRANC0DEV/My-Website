function getElement<T extends HTMLElement>(id: string): HTMLElement;
function getElement<T extends HTMLElement>(id: string, type: { new (): T }): T;
function getElement<T extends HTMLElement>(
  id: string,
  type?: { new (): T },
): T | HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new ReferenceError(`Element with id: ${id} can't be found`);
  }
  if (type && !(element instanceof type)) {
    throw new TypeError(`Element with id: ${id} is not of type ${type.name}`);
  }
  return type ? (element as T) : element;
}

export default getElement;
