import axios from 'axios';


class search{
    constructor(query){
        this.query = query;
    }

    async getResults() {
        try{
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
            this.result = res.data.recipes;
            console.log(this.result);
        }
        catch(error){
            alert(error);
        }
    }
}

export default search;