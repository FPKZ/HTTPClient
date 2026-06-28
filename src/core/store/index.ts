// Exportação das stores individuais
export { default as useTabStore } from "./useTabStore";
export { default as useCollectionStore } from "./useCollectionStore";
export { default as useInterfaceStore } from "./useInterfaceStore";
export { default as useDialogStore } from "./useDialogStore";
export { default as useModalStore } from "./useModalStore";
export { useSidebarModalStore } from "./useSidebarModalStore";
export { default as useUserStore } from "./useUserStore";

// Exportação de todos os tipos de estado e auxiliares da store
export type {
  Variable,
  Environment,
  Collection,
  TabUiState,
  Tab,
  Log,
  CollectionSlice,
  TabSlice,
} from "../../../types/store";

// Exportação de tipos de entidades da coleção
export type {
  RequestData,
  ResponseData,
  RouteData,
  TreeRouteNode,
  TreeFolderNode,
  CollectionItem,
  CollectionData,
} from "../../../types/entities/collection";

export type { User } from "../../../types/entities/user.d";
