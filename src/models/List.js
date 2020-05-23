import uniqid from 'uniqid';

export default class list{
    constructor(){
        this.items = []
    }

    addItem(count,unit,ingredient){
        const newItem = {
            id : uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(newItem);
        return newItem;
    }

    deleteItem(id){
        const index = this.items.findIndex(el => el.id === id)
        this.items.splice(index,1);
    }

    updateCount(id, newCount){
        this.items.find(el => el.id === id).count = newCount;
    }
}