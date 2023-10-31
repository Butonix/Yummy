import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ICategory, ISection, nullSection } from '../../../models/categories';
import { ActivatedRoute, Router } from '@angular/router';
import { SectionService } from '../../../services/section.service';
import { trigger } from '@angular/animations';
import { heightAnim, modal } from 'src/tools/animations';
import { Title } from '@angular/platform-browser';
import { RecipeService } from '../../../services/recipe.service';
import { Subject, takeUntil } from 'rxjs';
import { IRecipe } from '../../../models/recipes';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrls: [
    './categories-page.component.scss',
    '../../../../authentication/common-styles.scss',
  ],
  animations: [
    trigger('auto-complete', heightAnim()),
    trigger('modal', modal()),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPageComponent implements OnInit, OnDestroy {
  sections: ISection[] = [];
  categories: ICategory[] = [];
  isLoading = true;

  creatingMode = false;
  filter: string = '';

  section: ISection = nullSection;
  searchQuery: string = '';
  autocompleteShow: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autocomplete: any[] = [];
  title: string = '';
  recipes: IRecipe[] = [];
  categoriesToShow: ICategory[] = [];

  popularCategories: ICategory[] = [];

  protected destroyed$: Subject<void> = new Subject<void>();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private sectionService: SectionService,
    private cd: ChangeDetectorRef,
    private titleService: Title,
    private recipeService: RecipeService,
  ) {}

  getCategoriesData() {
    this.categoryService.categories$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: ICategory[]) => {
        this.categories = data;
        this.categories = this.categories.filter(
          (category) => category.status === 'public',
        );

        this.recipeService.recipes$
          .pipe(takeUntil(this.destroyed$))
          .subscribe((recipes: IRecipe[]) => {
            this.recipes = recipes;

            this.popularCategories = this.categoryService.getPopularCategories(
              this.categories,
              recipes,
            );
          });
        this.cd.markForCheck();
      });
  }

  getSectionsData() {
    this.sectionService.sections$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: ISection[]) => {
        this.title = 'Разделы';
        this.titleService.setTitle(this.title);
        this.sections = this.sectionService.getSectionsWithCategories(
          data,
          this.categories,
        );
        this.sections.sort((elem1: ISection, elem2: ISection) => {
          return elem1.name > elem2.name ? 1 : -1;
        });
        this.cd.markForCheck();
      });
  }

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.getCategoriesData();
      this.filter = data['filter'];
      this.categories = this.categoryService.sortCategoriesByName(
        this.categories,
      );
      if (this.filter === 'sections') {
        // если это все секции
        this.getSectionsData();
      } else if (this.filter === 'popular') {
        //если это секция популярных категорий
        this.title = 'Популярные категории';
        const popularCategoriesIds = this.popularCategories.map(
          (element) => element.id,
        );
        const popularSection: ISection = {
          ...nullSection,
          categories: popularCategoriesIds,
        };
        this.sections.push(popularSection);
      } else {
        //если это конкретная секция
        this.section = { ...data['SectionResolver'] };
        this.title = this.section.name;
        this.section.name = '';
        this.sections.push(this.section);
      }

      this.categoriesToShow = this.getCategoriesOfSection(this.section).slice(
        0,
        10,
      );

      this.titleService.setTitle(this.title);
      this.isLoading = false;
    });
  }

  getPublicCategories(section: ISection): ICategory[] {
    const publicCategories: ICategory[] = [];

    section.categories.forEach((categoryId) => {
      this.categories.forEach((element) => {
        if (element.id === categoryId && element.status === 'public')
          publicCategories.push(element);
      });
    });
    return publicCategories;
  }
  navigateTo(link: string) {
    this.router.navigateByUrl(link);
  }

  loadMoreCategories() {
    const currentLength = this.categoriesToShow.length;
    const nextRecipes = this.getCategoriesOfSection(this.section).slice(
      currentLength,
      currentLength + 5,
    );
    this.categoriesToShow = [...this.categoriesToShow, ...nextRecipes];
  }
  getCategoriesOfSection(section: ISection): ICategory[] {
    let sectionCategories: ICategory[] = [];
    if (this.filter === 'popular') {
      sectionCategories = this.popularCategories;
    } else {
      this.categories.forEach((category) => {
        if (section.categories.includes(category.id)) {
          sectionCategories.push(category);
        }
      });
    }

    return sectionCategories;
  }
  getSectionOfCategory(category: ISection): ISection {
    if (!category.categories) {
      return this.sectionService.getSectionOfCategory(this.sections, category);
    }
    return nullSection;
  }

  turnOffSearch() {
    this.searchQuery = '';
  }

  blurSearch() {
    this.autocompleteShow = false;
  }

  focusSearch() {
    if (this.searchQuery !== '') {
      this.autocompleteShow = true;
    }
  }
  turnOnSearch() {
    this.autocompleteShow = true;
    if (this.searchQuery.length > 0) {
      this.autocomplete = [];
      const notEmptySections = this.sectionService.getNotEmptySections(
        this.sections,
      );
      const filterSections: ISection[] = notEmptySections.filter(
        (section: ISection) =>
          section.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
      const filterCategories: ICategory[] = this.categories.filter(
        (category: ICategory) =>
          category.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
      filterCategories.forEach((filterCategory) => {
        this.autocomplete.push(filterCategory);
      });
      filterSections.forEach((filterSection) => {
        this.autocomplete.push(filterSection);
      });
    } else this.autocompleteShow = false;
  }
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
