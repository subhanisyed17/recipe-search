import Search from '../models/Search';
import Recipe from '../models/Recipe';
import List from '../models/List';
import Likes from '../models/Likes';
import * as searchView from '../views/searchView';
import * as recipeView from '../views/recipeView';
import * as listView from '../views/listView';
import * as likesView from '../views/likesView';
import {elements, renderLoader, clearLoader} from '../views/base';

const state = {

}

// ********* Search Controller **********// 

const controlSearch = async () => {
    // 1. get the query param
    const query = searchView.getInput();

    if(query){
        //2.pass this query param to API and get the result.
        state.search = new Search(query);

        //3. prepare the UI for results which are obtained from next step
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
            //4. get the results from the app
            await state.search.getResults();

            //5. Display the results on the UI.
            clearLoader();
            searchView.renderResults(state.search.result);
        }
        catch(error){
            alert('Error processing search');
        }
    }

}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


// ******** Recipe Controller ********** //

// const recipe = new Recipe(46956);
// console.log(recipe);

const controlRecipe = async () => {

    //Get Recipe ID from URL
    const id = window.location.hash.replace('#','');
    console.log(id);

    if(id){
        // Prepare the UI for showing results       
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected item
        if(state.search) searchView.highlightSelected(id);

        //intialize recipe model
        state.recipe = new Recipe(id);

        try{
            // get the results here
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //display the results on UI
            clearLoader();
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
            console.log(state.recipe);
        }
        catch(error){
            alert(error);
        }

    }
}

['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));


// ********* List Controller ********** //

const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

// ******* Likes Controller ********** //

const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentRecipeId = state.recipe.id;
    // Two cases can arise when this controller is called, recipe is already liked or not liked
    //not liked case
    if(!state.likes.isLiked(currentRecipeId)){
        //add recipe to the likes list
        const newLike = state.likes.addLikedItem(
                            currentRecipeId,
                            state.recipe.title,
                            state.recipe.author,
                            state.recipe.img
                        )
        //toggle the like button
        likesView.toggleLikedBtn(true);

        //display it on the UI
        likesView.renderLikedItem(newLike);
        console.log(state.likes.likes);

    }
    //recipe was already liked case
    else{
        //delete recipe from the likes list
        state.likes.deleteLikedItem(currentRecipeId);

        //toggle the like button
        likesView.toggleLikedBtn(false);

        //remove it from the UI
        likesView.deleteLikedItem(currentRecipeId);
        console.log(state.likes.likes);

    }
    likesView.toggleLikeMenu(state.likes.getnumLikes());
}

//get the persisted data upon page re-load

window.addEventListener('load',() => {
    //create new likes object
    state.likes = new Likes();

    //get the persisted data from local storage
    state.likes.readStorage();

    // toggle like menu button
    likesView.toggleLikeMenu(state.likes.getnumLikes());

    //display all the likes present in persisted storage
    state.likes.likes.forEach(like => likesView.renderLikedItem(like));
    
});

// Update Ingredients

elements.recipe.addEventListener('click', e => {   
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        if(state.recipe.servings > 1){
            //call recipeModel method to calculate changes
            state.recipe.updateServings('dec');
            // call view method to display the changes on UI
            recipeView.updatedServingsIngredients(state.recipe);
        }
    }
    else if(e.target.matches('.btn-increase,.btn-increase *')){
        state.recipe.updateServings('inc');
        // call view method to display the changes on UI
        recipeView.updatedServingsIngredients(state.recipe);
    }
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredients to shopping list
        controlList();
    }
    else if(e.target.matches('.recipe__love,.recipe__love *')){
        controlLike();
    }
})


