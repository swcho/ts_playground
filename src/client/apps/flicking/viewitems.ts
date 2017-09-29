
import {LinearBufferObj, forEach, getMinMaxIndex} from './linearbuffer';

export interface ViewItem {
    key: number;
    index: number;
    el?: HTMLDivElement;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    active?: boolean;
}

export type ViewItems = LinearBufferObj<ViewItem>;

export function init(viewItems: ViewItems, itemLen: number, anchorIndex: number = 0) {
    viewItems[0] = {
        key: 0,
        index: anchorIndex,
    };
}

export function updateViewItemInfo(viewItem: ViewItem) {
    const {
        el
    } = viewItem;
    const elChild = el.children[0] as HTMLElement;
    viewItem.width = elChild.clientWidth;
    viewItem.height = elChild.clientHeight;
    viewItem.visible = true;
}

export function reconcile(viewItems: ViewItems, horizontal: boolean, viewSize: number, anchorPos: number, itemLen: number) {
    const [idxMin, idxMax] = getMinMaxIndex(viewItems);
    const heaf = viewSize / 2;
    const boundMin = -anchorPos - viewSize;
    const boundMax = -anchorPos + viewSize + heaf;

    let viewItemsModified = false;

    const itemMin = viewItems[idxMin];
    if (!itemMin.visible) {
        updateViewItemInfo(itemMin);
        const next = viewItems[idxMin + 1];
        if (horizontal) {
            itemMin.x = next.x - itemMin.width;
            itemMin.y = 0;
        } else {
            itemMin.y = next.y - itemMin.height;
            itemMin.x = 0;
        }
        viewItemsModified = true;
        console.log('updateMin', idxMin);
    }

    const viewBoundMin = horizontal ? itemMin.x : itemMin.y;
    if (boundMin < viewBoundMin) {
        const prevKey = idxMin - 1;
        const prevIndex = itemMin.index === 0 ? itemLen - 1 : itemMin.index - 1;
        viewItems[prevKey] = {
            key: prevKey,
            index: prevIndex,
        };
        viewItemsModified = true;
        console.log('addToPrev', prevKey);
    }

    const itemMax = viewItems[idxMax];
    if (!itemMax.visible) {
        updateViewItemInfo(itemMax);
        const prev = viewItems[idxMax - 1];
        if (horizontal) {
            itemMax.x = prev.x + prev.width;
            itemMax.y = 0;
        } else {
            itemMax.y = prev.y + prev.height;
            itemMax.x = 0;
        }
        viewItemsModified = true;
        console.log('updateMax', idxMin);
    }

    const viewBoundMax = horizontal ? itemMax.x + itemMax.width : itemMax.y + itemMax.height;
    if (viewBoundMax < boundMax) {
        const nextKey = idxMax + 1;
        const nextIndex = itemMax.index === itemLen - 1 ? 0 : itemMax.index + 1;
        viewItems[nextKey] = {
            key: nextKey,
            index: nextIndex,
        };
        viewItemsModified = true;
        console.log('addToNext', nextKey);
    }

    forEach(viewItems, (viewItem) => {
        const underFit = (horizontal ? viewItem.x + viewItem.width : viewItem.y + viewItem.height) < boundMin;
        const overFit = boundMax < (horizontal ? viewItem.x : viewItem.y);
        if (underFit || overFit) {
            delete viewItems[viewItem.key];
            viewItemsModified = true;
            console.log('itemRemoved', viewItem.key);
        }
    });

    return viewItemsModified;
}

function findByPos(viewItems: ViewItems, horizontal: boolean, pos: number) {
    const [idxMin, idxMax] = getMinMaxIndex(viewItems);
    for (let i = idxMin; i <= idxMax; i += 1) {
        const viewItem = viewItems[i];
        if (horizontal ? pos === viewItem.x : pos === viewItem.y) {
            return viewItem;
        }
    }
    return null;
}

export function getNextAnchorableItem(viewItems: ViewItems, horizontal: boolean, anchorPos: number) {
    const [idxMin, idxMax] = getMinMaxIndex(viewItems);
    for (let i = idxMin; i <= idxMax; i += 1) {
        const viewItem = viewItems[i];
        const pos = horizontal ? viewItem.x : viewItem.y;
        if (anchorPos < pos) {
            return viewItem;
        }
    }
}

export function getPrevAnchorableItem(viewItems: ViewItems, horizontal: boolean, anchorPos: number) {
    const [idxMin, idxMax] = getMinMaxIndex(viewItems);
    for (let i = idxMax; i >= idxMin; i -= 1) {
        const viewItem = viewItems[i];
        const pos = horizontal ? viewItem.x : viewItem.y;
        if (pos < anchorPos) {
            return viewItem;
        }
    }
}

export function setActive(viewItems: ViewItems, viewItem: ViewItem) {
    const [idxMin, idxMax] = getMinMaxIndex(viewItems);
    for (let i = idxMin; i <= idxMax; i += 1) {
        const item = viewItems[i];
        item.active = (viewItem.key === i);
    }
}
