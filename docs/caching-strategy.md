# Caching Strategy Documentation

## Overview

This document outlines the comprehensive caching strategy implemented using TanStack React Query for the LIMS application.

## Caching Layers

### 1. Authentication Caching
- **User Profile**: Cached for 5 minutes, GC after 10 minutes
- **Token Verification**: Cached for 5 minutes
- **Auto-refresh**: Tokens refreshed 30 seconds before expiry

### 2. Data Entity Caching

#### Clients
- **List Data**: 2 minutes stale, 10 minutes GC
- **Individual Client**: 5 minutes stale, 15 minutes GC
- **Search Results**: 2 minutes stale, 10 minutes GC

#### Test Methods
- **List Data**: 3 minutes stale, 15 minutes GC
- **Individual Method**: 10 minutes stale, 30 minutes GC
- **Search Results**: 3 minutes stale, 15 minutes GC

#### Equipments
- **List Data**: 5 minutes stale, 20 minutes GC
- **Individual Equipment**: 10 minutes stale, 30 minutes GC
- **Search Results**: 5 minutes stale, 20 minutes GC

#### Sample Data
- **Sample Information**: 3 minutes stale, 15 minutes GC
- **Sample Preparation**: 3 minutes stale, 15 minutes GC
- **Sample Lots**: 3 minutes stale, 15 minutes GC

#### Testing Data
- **Proficiency Testing**: 5 minutes stale, 20 minutes GC
- **Calibration Testing**: 5 minutes stale, 20 minutes GC

#### Reports & Certificates
- **Test Reports**: 10 minutes stale, 30 minutes GC
- **Complete Certificates**: 10 minutes stale, 30 minutes GC

#### Welders & PQR
- **Welders**: 5 minutes stale, 20 minutes GC
- **PQR Records**: 5 minutes stale, 20 minutes GC

## Cache Invalidation Strategy

### Automatic Invalidation
1. **On Create**: Invalidate list queries, add new item to cache
2. **On Update**: Update specific item in cache, invalidate lists
3. **On Delete**: Remove item from cache, invalidate lists
4. **On Logout**: Clear all cache

### Manual Invalidation
- **Auth Changes**: Invalidate all auth-related queries
- **Data Refresh**: Invalidate specific entity queries
- **Bulk Operations**: Invalidate multiple related queries

## Performance Optimizations

### 1. Prefetching
- **Hover Prefetch**: Prefetch data on hover for better UX
- **Route Prefetch**: Prefetch data for likely next routes
- **Background Refresh**: Refresh stale data in background

### 2. Query Deduplication
- **Same Query Key**: Automatically deduplicated
- **Parallel Requests**: Same query won't make duplicate requests
- **Request Batching**: Multiple components requesting same data

### 3. Background Updates
- **Window Focus**: Refetch on window focus
- **Network Reconnect**: Refetch on network reconnection
- **Stale While Revalidate**: Show cached data while fetching fresh

## Error Handling

### Retry Strategy
- **Auth Errors (401/403)**: No retry
- **Network Errors**: Retry up to 2 times with exponential backoff
- **Server Errors (5xx)**: Retry up to 2 times

### Error Boundaries
- **Query Errors**: Graceful fallback to cached data
- **Mutation Errors**: User-friendly error messages
- **Network Errors**: Offline state handling

## Cache Size Management

### Garbage Collection
- **Automatic**: Based on `gcTime` settings
- **Manual**: Clear unused cache on logout
- **Size Limits**: Prevent memory leaks

### Memory Optimization
- **Stale Data**: Remove unused stale data
- **Inactive Queries**: Garbage collect inactive queries
- **Background Cleanup**: Regular cache cleanup

## Implementation Guidelines

### 1. Query Keys
- **Consistent Structure**: Use consistent query key patterns
- **Hierarchical**: Group related queries
- **Versioned**: Include version in keys for breaking changes

### 2. Hooks Pattern
- **Custom Hooks**: Encapsulate query logic in custom hooks
- **Reusable**: Create reusable query hooks
- **Type Safe**: Full TypeScript support

### 3. Cache Updates
- **Optimistic Updates**: Update cache immediately on mutations
- **Rollback**: Rollback on mutation failure
- **Consistency**: Maintain cache consistency

## Monitoring & Debugging

### DevTools
- **React Query DevTools**: Visual cache inspection
- **Query States**: View query loading/error states
- **Cache Contents**: Inspect cached data

### Logging
- **Query Performance**: Track query execution times
- **Cache Hits**: Monitor cache hit rates
- **Error Tracking**: Log query errors

## Best Practices

### 1. Query Design
- **Single Responsibility**: One query per data entity
- **Minimal Dependencies**: Reduce query dependencies
- **Efficient Keys**: Use efficient query keys

### 2. Mutation Design
- **Atomic Operations**: Single responsibility mutations
- **Error Handling**: Comprehensive error handling
- **Cache Updates**: Proper cache invalidation

### 3. Performance
- **Lazy Loading**: Load data when needed
- **Pagination**: Implement efficient pagination
- **Search Optimization**: Debounced search queries

## Future Enhancements

### 1. Advanced Caching
- **Persistent Cache**: Persist cache across sessions
- **Selective Invalidation**: More granular cache control
- **Cache Compression**: Compress large cached data

### 2. Real-time Updates
- **WebSocket Integration**: Real-time data updates
- **Optimistic Updates**: Immediate UI updates
- **Conflict Resolution**: Handle concurrent updates

### 3. Analytics
- **Usage Metrics**: Track cache usage patterns
- **Performance Metrics**: Monitor query performance
- **User Behavior**: Analyze user interaction patterns
