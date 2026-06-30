// Store
import { useUserStore } from "@/core/store";

// Hooks
import useHistory from "@/core/hooks/useHistory";
import useCollectionImport from "@/core/hooks/useCollectionImport";

// Ui
import Icons from "@/assets/Icons";
import HistoryList from "../history/HistoryList";
import { FilePlus, Plus } from "lucide-react";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";

export default function Hub() {
  const { roundIcon } = Icons();

  const {
    history,
    handleLoadHistory,
    handleDeleteHistoryItem,
    handleDeleteAllHistory,
  } = useHistory();

  const {
    isImportModalOpen,
    setIsImportModalOpen,
    startConversion,
    handleFolderSelect,
  } = useCollectionImport();

  const user = useUserStore((state) => state.user);

  return (
    <div className="w-full h-full flex flex-col gap-6 items-center justify-center text-text-secondary">
      <div className="flex flex-col w-6/9 @2xl:w-4/6 @3xl:w-4/8 @4xl:w-3/8 @5xl:w-3/9 max-w-120">
        <div className="flex flex-col items-center justify-center mb-5">
          {roundIcon({ size: "xl" })}
          <p className="text-[2.5rem] mt-3 font-bold text-text-primary">
            Volt API Client
          </p>
          <p className="text-text-muted text-md mt-1">
            Selecione uma coleção para começar
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full font-bold text-sm">
          <NovaCollectionModal>
            <button className="btn-primary flex items-center justify-center gap-2 py-3">
              <Plus size={15} strokeWidth={3} />
              New Collection
            </button>
          </NovaCollectionModal>
          <ImportCollectionModal
            open={isImportModalOpen}
            onOpenChange={setIsImportModalOpen}
            onImport={(path) => {
              setIsImportModalOpen(false);
              startConversion(path, true);
            }}
            onFolderSelect={async () => {
              setIsImportModalOpen(false);
              await handleFolderSelect();
            }}
          >
            <button className="btn-secondary flex items-center justify-center gap-2 py-3">
              <FilePlus size={15} strokeWidth={3} />
              Import Collection
            </button>
          </ImportCollectionModal>
        </div>
      </div>

      <div className="flex @3xl:flex-row flex-col w-8/11 max-w-220 gap-6 p-4">
        <div className="flex flex-col w-full">
          <HistoryList
            history={history}
            onLoad={handleLoadHistory}
            onDelete={handleDeleteHistoryItem}
            onAllDelete={handleDeleteAllHistory}
          />
        </div>
        {user && (
          <div className="flex w-full @3xl:w-4/6 @4xl:w-6/8 @5xl:w-5/7">
            <HistoryList
              history={history}
              onLoad={handleLoadHistory}
              onDelete={handleDeleteHistoryItem}
              onAllDelete={handleDeleteAllHistory}
            />
          </div>
        )}
      </div>
    </div>
  );
}
