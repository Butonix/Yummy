import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { IRecipe, nullRecipe } from 'src/app/modules/recipes/models/recipes';
import { RecipeService } from '../../../services/recipe.service';
import { trigger } from '@angular/animations';
import { heightAnim, modal, onlyHeight } from 'src/tools/animations';
import { Router } from '@angular/router';
import { IUser, nullUser } from 'src/app/modules/user-pages/models/users';
import { UserService } from 'src/app/modules/user-pages/services/user.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-recipe-list-item',
  templateUrl: './recipe-list-item.component.html',
  styleUrls: ['./recipe-list-item.component.scss'],
  animations: [trigger('modal', modal())],
})
export class RecipeListItemComponent implements OnInit, OnDestroy {
  @Input() recipe: IRecipe = nullRecipe;
  @Input() context: string = '';
  @Input() showAuthor: boolean = true;

  protected destroyed$: Subject<void> = new Subject<void>();

  likes: number = 0;
  cooks: number = 0;
  editMode: boolean = false;
  isRecipeFavorite: boolean = false;
  isRecipeLiked: boolean = false;
  isRecipeCooked: boolean = false;
  noAccessModalShow: boolean = false;
  dataLoaded = false;
  currentUserId = 0;
  author: IUser = { ...nullUser };
  successEditModalShow: boolean = false;
  moreAuthorButtons: boolean = false;

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  editModeOff() {
    this.editMode = false;
  }
  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((currentUser) => {
        this.currentUserId = currentUser.id;
        this.recipeService.recipes$
          .pipe(takeUntil(this.destroyed$))
          .subscribe((recipes) => {
            const findedRecipe = recipes.find((recipe) => {
              return recipe.id === this.recipe.id;
            });
            if (findedRecipe) this.recipe = findedRecipe;
            if (this.currentUserId !== 0) {
              this.isRecipeLiked = this.recipe.likesId.includes(
                this.currentUserId,
              );
              this.isRecipeCooked = this.recipe.cooksId.includes(
                this.currentUserId,
              );
              this.isRecipeFavorite = this.recipe.favoritesId.includes(
                this.currentUserId,
              );
            }

            this.cd.markForCheck();
          });
      });

    this.userService.users$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((users) => {
        const findedAuthor = users.find((user) => {
          if (user.id === this.recipe.authorId) return true;
          else return false;
        });
        if (findedAuthor) this.author = findedAuthor;
        this.dataLoaded = true;
        this.cd.markForCheck();
      });
  }

  //добавляем рецепт в избранное
  makeThisRecipeFavorite() {
    if (this.currentUserId === 0) {
      this.noAccessModalShow = true;
      return;
    }

    this.isRecipeFavorite = !this.isRecipeFavorite;
    this.recipe = this.isRecipeFavorite
      ? this.recipeService.addRecipeToFavorites(this.currentUserId, this.recipe)
      : this.recipeService.removeRecipeFromFavorites(
          this.currentUserId,
          this.recipe,
        );

    this.recipeService
      .updateRecipe(this.recipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => console.log('Рецепт успешно добавлен в избранное'),
        (error: Error) =>
          console.error(
            'Ошибка добавления рецепта в избранное: ' + error.message,
          ),
      );
  }

  handleEditedRecipe(event: IRecipe) {
    this.editMode = false;
    this.editedRecipe = event;
    if (this.editedRecipe.status === 'awaits') {
      this.isAwaitingApprove = true;
    }
    this.successEditModalShow = true;
  }
  isAwaitingApprove: boolean = false;
  editedRecipe: IRecipe = nullRecipe;
  deleteRecipeModalShow: boolean = false;
  successDeleteModalShow: boolean = false;
  handleDeleteRecipeModal(event: boolean) {
    if (event) {
      this.successDeleteModalShow = true;
    }
    this.deleteRecipeModalShow = false;
  }
  handleSuccessEditModal() {
    //?????????????? если наоборот сначала обновить то это модальное окно пропускается
    this.recipeService.updateRecipe(this.editedRecipe).subscribe(() => {
      this.router.navigateByUrl('recipes/list/' + this.editedRecipe.id);
    });
  }
  handleSuccessDeleteModal() {
    //?????????????? если наоборот сначала удалить то это модальное окно пропускается
    this.recipeService.deleteRecipe(this.recipe.id);
  }
  handleInnerFunction(event: Event) {
    // Этот метод вызывается при клике на внутренний элемент рецепта
    // Останавливаем всплытие события, чтобы оно не дошло до внешнего контейнера
    event.stopPropagation();
  }


  //лайкаем рецепт
  likeThisRecipe() {
    if (this.currentUserId === 0) {
      this.noAccessModalShow = true;
      return;
    }

    this.isRecipeLiked = !this.isRecipeLiked;

    this.recipe = this.isRecipeLiked
      ? this.recipeService.likeRecipe(this.currentUserId, this.recipe)
      : this.recipeService.unlikeRecipe(this.currentUserId, this.recipe);

    this.recipeService
      .updateRecipe(this.recipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => console.log('Рецепт успешно оценен'),
        (error: Error) =>
          console.error('Ошибка оценки рецепта: ' + error.message),
      );
  }
  //готовим рецепт
  cookThisRecipe() {
    if (this.currentUserId === 0) {
      this.noAccessModalShow = true;
      return;
    }

    this.isRecipeCooked = !this.isRecipeCooked;

    this.recipe = this.isRecipeCooked
      ? this.recipeService.cookRecipe(this.currentUserId, this.recipe)
      : this.recipeService.uncookRecipe(this.currentUserId, this.recipe);

    this.recipeService
      .updateRecipe(this.recipe)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        () => console.log('Рецепт успешно отмечен приготовленным'),
        (error: Error) =>
          console.error(
            'Ошибка отметки рецепта приготовленным: ' + error.message,
          ),
      );
  }

  // модальное окно (пользователь не вошел в аккаунт)
  handleNoAccessModal(result: boolean) {
    if (result) {
      this.router.navigateByUrl('/greetings');
    }
    this.noAccessModalShow = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
