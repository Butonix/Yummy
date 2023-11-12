import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import {
  ICategory,
  ISection,
} from '../../recipes/models/categories';
import { Router } from '@angular/router';
import { trigger } from '@angular/animations';
import { heightAnim } from 'src/tools/animations';
import { IIngredientsGroup } from '../../recipes/models/ingredients';

export interface SectionGroup {
  section: ISection;
  categories: ICategory[];
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  animations: [trigger('height', heightAnim())],
})
export class AutocompleteComponent implements OnChanges {
  @Output() categoryEmitter = new EventEmitter<ICategory>();
  @Output() sectionEmitter = new EventEmitter<ISection>();
  @Output() groupEmitter = new EventEmitter<IIngredientsGroup>();

  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() group: SectionGroup[] = [];
  @Input() ingredientsGroups: IIngredientsGroup[] = [];
  filterIngredientsGroups: IIngredientsGroup[] = [];
  @Input() sectionMode = false;

  isSleep: boolean = false; //подсвечивается ли плейсхолдер
  isFocused = false; //есть ли фокус в инпуте (нужно ли подсвечивать плейсхолдер)

  fullGroup: SectionGroup[] = [];
  autocompleteShow: boolean = false;
  categories: ICategory[] = [];
  sections: ISection[] = [];
  value = '';

  mySections: ISection[] = [];
  @Input() allSections: ISection[] = [];

  getFullGroup = false;

  constructor(private router: Router) {}

  ngOnChanges() {
    this.mySections = this.allSections;
    this.fullGroup = this.group;
    this.filterIngredientsGroups = this.ingredientsGroups
  }

  focus() {
    this.autocompleteShow = true;
    this.isFocused = true;
    this.isSleep = false;
  }

  blur() {
    this.autocompleteShow = false;
    this.isFocused = false;
    if (this.value != '') {
      this.isFocused = true;
      this.isSleep = true;
    }
  }

  goToLink(link: string): void {
    this.router.navigateByUrl(link);
  }
  addCategory(listCategory: ICategory) {
    this.categoryEmitter.emit(listCategory);
  }
  addSection(listSection: ISection) {
    this.sectionEmitter.emit(listSection);
  }
  addIngredientGroup(listIngredientGroup: IIngredientsGroup) {
    this.groupEmitter.emit(listIngredientGroup)
  }
  copyOfFullGroup() {
    setTimeout(() => {
      this.group = JSON.parse(JSON.stringify(this.fullGroup));
    }, 300);
  }

  search() {
    if (!this.ingredientsGroups.length) {
      if (!this.sectionMode) {
        if (this.value !== '') {
          this.group = [];
          const search = this.value.toLowerCase().replace(/\s/g, '');
          const filterGroups: SectionGroup[] = [];
          const allGroup: SectionGroup[] = JSON.parse(
            JSON.stringify(this.fullGroup),
          );

          allGroup.forEach((itsGroup: SectionGroup) => {
            itsGroup.categories = itsGroup.categories.filter((element) => {
              if (
                element.name.toLowerCase().replace(/\s/g, '').includes(search)
              )
                return true;
              else return false;
            });
            if (itsGroup.categories.length > 0) filterGroups.push(itsGroup);
          });

          filterGroups.forEach((element) => {
            this.group.push(element);
          });
        } else {
          this.group = JSON.parse(JSON.stringify(this.fullGroup));
        }
      } else {
        if (this.value !== '') {
          this.mySections = [];
          const search = this.value.toLowerCase().replace(/\s/g, '');
          const filterSections: ISection[] = [];
          const allSections: ISection[] = JSON.parse(
            JSON.stringify(this.allSections),
          );

          allSections.forEach((item: ISection) => {
            if (item.name.toLowerCase().replace(/\s/g, '').includes(search))
              filterSections.push(item);
          });

          filterSections.forEach((element) => {
            this.mySections.push(element);
          });
        } else {
          this.mySections = JSON.parse(JSON.stringify(this.allSections));
        }
      }
    } else {

       if (this.value !== '') {
         this.filterIngredientsGroups = [];
         const search = this.value.toLowerCase().replace(/\s/g, '');
         const filterIngredients: IIngredientsGroup[] = [];
         const allIngredients = this.ingredientsGroups;

         allIngredients.forEach((item: IIngredientsGroup) => {
           if (item.name.toLowerCase().replace(/\s/g, '').includes(search))
             filterIngredients.push(item);
         });

         filterIngredients.forEach((element) => {
           this.filterIngredientsGroups.push(element);
         });
       } else {
         this.filterIngredientsGroups = this.ingredientsGroups;
       }
    }
  }

}
