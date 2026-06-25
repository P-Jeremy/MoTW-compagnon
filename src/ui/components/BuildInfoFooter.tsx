export function BuildInfoFooter() {
  return (
    <footer className="fixed bottom-0 right-0 px-2 py-0.5 text-[10px] text-stone-400">
      {__COMMIT_SHA__}
    </footer>
  );
}
