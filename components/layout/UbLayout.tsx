'use client';

import { useMobileFilter, FilterToggleButton, MobileFilterDrawer } from './MobileFilterDrawer';
import { useResizableSidebar } from './ResizableSidebar';

/* ─── Shared layout for the Üben content pages ─────────────────
   Puts the filter + selection list into a left sidebar that is
   drag-to-resize on desktop (like Vokabeln) and collapses behind a
   filter button + drawer on mobile.

   `sidebar` may be a node, or a function receiving a `closeDrawer`
   callback (so tapping a list item on mobile can close the drawer). */
type SidebarRender = React.ReactNode | ((closeDrawer: () => void) => React.ReactNode);

export function UbLayout({ sidebar, children, drawerTitle = 'Filter & Auswahl' }: {
  sidebar: SidebarRender;
  children: React.ReactNode;
  drawerTitle?: string;
}) {
  const { filterOpen, setFilterOpen, isMobile } = useMobileFilter();
  // For these Üben pages we use the resizable/collapsible sidebar (like other sections).
  // Default open. The "Show Filters / Hide Filters" toggle button is always shown in the content area.
  const { asideStyle, DragHandle, collapsed, SidebarToggle } = useResizableSidebar(280, 210, 480, false);

  const resolve = (close: () => void) =>
    typeof sidebar === 'function' ? (sidebar as (c: () => void) => React.ReactNode)(close) : sidebar;

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', position: 'sticky', top: 51, zIndex: 39 }}>
          <FilterToggleButton onClick={() => setFilterOpen(true)} label="⚙ Filter & Auswahl" />
        </div>
        <div>{children}</div>
        <MobileFilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)} title={drawerTitle}>
          {resolve(() => setFilterOpen(false))}
        </MobileFilterDrawer>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 51px)', alignItems: 'stretch' }}>
      {!collapsed && (
        <aside style={{
          ...asideStyle,
          borderRight: '1px solid var(--border)', background: 'var(--bg2)',
          overflowY: 'auto', maxHeight: 'calc(100vh - 51px)',
          position: 'sticky', top: 51, alignSelf: 'flex-start',
        }}>
          {resolve(() => {})}
        </aside>
      )}
      {!collapsed && <DragHandle />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 12px 0' }}>
          <SidebarToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
