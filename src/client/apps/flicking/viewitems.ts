
import {LinearBufferObj, minIndex, maxIndex, forEach, getMinMaxIndex} from './linearbuffer';

export interface ViewItem {
    key: number;
    index: number;
    el?: HTMLDivElement;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
}

export type ViewItems = LinearBufferObj<ViewItem>;

export function init(viewItems: ViewItems, itemLen: number, anchorIndex: number = 0) {
    viewItems[0] = {
        key: 0,
        index: anchorIndex,
    };
}

export function addToPrev(viewItems: ViewItems, itemLen: number) {
    const idxMin = minIndex(viewItems);
    const min = viewItems[idxMin];
    const prevKey = idxMin - 1;
    const prevIndex = min.index === 0 ? itemLen - 1 : min.index - 1;
    console.log('addToPrev', prevKey);
    viewItems[prevKey] = {
        key: prevKey,
        index: prevIndex,
    };
}

export function addToNext(viewItems: ViewItems, itemLen: number) {
    const idxMax = maxIndex(viewItems);
    const max = viewItems[idxMax];
    const nextKey = idxMax + 1;
    const nextIndex = max.index === itemLen - 1 ? 0 : max.index + 1;
    console.log('addToNext', nextKey);
    viewItems[nextKey] = {
        key: nextKey,
        index: nextIndex,
    };
}

export function calculateInfo(viewItems: ViewItems, horizontal: boolean) {
    let updated = false;

    const idxMin = minIndex(viewItems);
    const idxMax = maxIndex(viewItems);
    const itemMin = viewItems[idxMin];
    const itemMax = viewItems[idxMax];

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
        updated = true;
    }

    if (!itemMax.visible) {
        updateViewItemInfo(itemMax);
        const prev = viewItems[idxMax - 1];
        if (horizontal) {
            itemMax.x = prev.x + prev.width;
            itemMin.y = 0;
        } else {
            itemMax.y = prev.y + prev.height;
            itemMin.x = 0;
        }
        updated = true;
    }

    return updated;
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
    const boundMin = -anchorPos;
    const boundMax = -anchorPos + viewSize;

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
