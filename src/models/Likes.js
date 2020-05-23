export default class likes {
    constructor(){
        this.likes = [];
    }

    addLikedItem(id,title,author,img){
        const newItem = {
            id,
            title,
            author,
            img
        }
        this.likes.push(newItem);
        this.persistData();
        return newItem;
    }

    deleteLikedItem(id){
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index,1);
        this.persistData();
    }

    isLiked(id){
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getnumLikes(){
        return this.likes.length;
    }

    persistData(){
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage(){
        const storage = JSON.parse(localStorage.getItem('likes'));
        if(storage) this.likes = storage;
    }
}