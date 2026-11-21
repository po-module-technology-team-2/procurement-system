/**
 * Domain-based Type System
 * Re-exports all domain types for seamless backwards compatibility.
 * 
 * If you are an AI or developer, you do NOT need to read this entire index!
 * Jump directly to the relevant domain type file:
 * - navigation.ts: NavView, UserRole, UserProfile
 * - equipment.ts: ProcessType, TeamType, FactoryLineType, EmNoRecord, EquipmentStatus
 * - requisition.ts: RequisitionItem, RequisitionStatus, Priority, SlaStatus, DemandReasonConfig
 * - personnel.ts: PersonnelMember, PersonnelRole, TeamConfig, LecReviewerConfig, PolicySettings
 * - nexacro.ts: NexacroItemInfo, PriceStatusDefinition, InventoryItem
 */

export * from './navigation';
export * from './equipment';
export * from './requisition';
export * from './personnel';
export * from './nexacro';
