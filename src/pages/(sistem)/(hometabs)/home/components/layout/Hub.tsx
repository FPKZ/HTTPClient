// Store
import { useUserStore } from "@/core/store";
import useWorkspacesStore from "@/core/store/slices/useWorkspacesStore";

// Hooks
import useHistory from "@/core/hooks/useHistory";
import useCollectionImport from "@/core/hooks/useCollectionImport";

// Ui
import Icons from "@/assets/Icons";
import HistoryList from "../history/HistoryList";
import { FilePlus, Plus } from "lucide-react";
import NovaCollectionModal from "@/components/modals/NovaCollectionModal";
import ImportCollectionModal from "@/components/modals/ImportCollectionModal";
import Workspaces from "@/pages/(sistem)/(hometabs)/workspaces";
import { useNavigate } from "react-router-dom";

export default function Hub() {
  const { roundIcon } = Icons();

  const navigate = useNavigate();

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

  const { workspaces } = useWorkspacesStore();

  return (
    <div className="w-full h-full flex flex-col gap-6 items-center justify-center text-text-secondary">
      <div className="flex flex-col w-6/9 @2xl:w-4/6 @3xl:w-4/8 @4xl:w-3/8 @5xl:w-3/9 max-w-120">
        <div className="flex flex-col items-center justify-center mb-5">
          {roundIcon({ size: "xl" })}
          <p className="text-[2.5rem] mt-3 font-bold text-text-primary">
            Volt API Client
          </p>
          <p className="text-text-muted text-sm mt-2 text-center max-w-sm">
            High-performance workbench for modern API development and architecture.
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
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between border-b border-zinc-800 pb-2 mb-3">
                <h6
                  className="text-zinc-500 uppercase tracking-wider font-bold font-sans text-[0.7rem]"
                >
                  Meus Workspaces
                </h6>
              </div>
              {(workspaces || []).filter(Boolean).slice(0, 2).map((workspace, index) => (
                <Workspaces.Card key={index} index={index} workspace={workspace} />
              ))}
              <button 
                className="
                  w-full py-2 
                  font-sans font-bold text-sm text-brand hover:text-brand-hover
                  border border-dashed border-zinc-700 hover:border-brand-hover rounded-sm
                  transition-colors duration-200 ease-in-out
                  cursor-pointer
                "
                onClick={() => navigate("/workspaces")}
              >
                View All Workspaces
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
