// /groups/[slug]/page.jsx

export const dynamic = 'force-dynamic'; 

import CommunityFeedPage from '../CommunityFeedPage.jsx';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/mongoose'; 
import Group from '@/models/Group'; 


// Utility to safely fetch group data by slug (kept as is, no changes needed here)
async function getCommunityBySlug(slug) {
    if (!slug) return null;
    
    try {
        await dbConnect();
        
        const community = await Group.findOne({ slug: slug })
            .select("_id name description ownerEmail membersCount category iconUrl bannerUrl slug")
            .lean();

        if (!community) return null;

        return {
            id: community._id.toString(),
            name: community.name,
            description: community.description,
            members: community.membersCount || 0,
            online: 0,
            iconUrl: community.iconUrl,
            bannerUrl: community.bannerUrl,
            slug: community.slug,
            ownerEmail: community.ownerEmail,
            isJoined: true,
        };
    } catch (error) {
        console.error("DATABASE FETCH ERROR in groups/[slug]/page.jsx:", error);
        return null; 
    }
}


// This is the App Router Page Component
export default async function CommunityFeedRoute({ params }) {
    // 1. FIX for `params.slug` warning/error: Await the dynamic parameter
    const slug = await params.slug;

    if (!slug) {
        // Use the suggested notFound() for graceful 404 handling
        notFound(); 
    }
    
    // 2. Fetch the community data
    const community = await getCommunityBySlug(slug);
    
    if (!community) {
        notFound(); 
    }

    // 3. FIX for "Event handlers cannot be passed"
    // We pass ONLY the static data required by the client component.
    return (
        <CommunityFeedPage 
            community={community} 
        />
    );
}