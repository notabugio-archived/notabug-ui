import { provideState, update } from "freactal";
import { always, identity } from "ramda";

const optionMap = {
  save: [
    "liked",
    "custom"
  ],
  hide: [
    "disliked",
    "custom"
  ],
  spam: [
    "spam",
    "custom"
  ]
};

const categoryOptions = label => optionMap[label] || optionMap.save;

const initialState = ({ id, label }) => {
  const options = categoryOptions(label);
  return {
    saveThingId: id,
    selectedCategory: options[0],
    customCategory: "",
    categoryOptions: options,
    isSaveModalOpen: false
  };
};

const onShowSave = update(always({ isSaveModalOpen: true }));
const onHideSave = update(always({ isSaveModalOpen: false }));
const onSelectCategory = update((state, selectedCategory) => ({ selectedCategory }));
const onSetCustomCategory = update((state, customCategory) => ({ customCategory }));

const onSaveThing = () => {
  alert("save");
  return identity;
};

const isCustomSelected = ({ selectedCategory }) => selectedCategory === "custom";
const categoryToSaveTo = state =>
  isCustomSelected(state) ? state.customCategory : state.selectedCategory;

export const saveThingProvider = provideState({
  initialState,
  effects: { onShowSave, onHideSave, onSelectCategory, onSetCustomCategory, onSaveThing },
  computed: { isCustomSelected, categoryToSaveTo }
});
