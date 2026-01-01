import type { FC } from 'hono/jsx';
import type { TagInfo } from '../api';

interface TagChipProps {
    name: string;
    count?: number;
    size?: 'small' | 'medium' | 'large';
    clickable?: boolean;
}

export const TagChip: FC<TagChipProps> = ({
    name,
    count,
    size = 'medium',
    clickable = true
}) => {
    const Tag = clickable ? 'a' : 'span';
    const props = clickable ? { href: `/search?tag=${encodeURIComponent(name)}` } : {};

    return (
        <Tag class={`tag-chip tag-chip-${size}`} {...props}>
            <span class="tag-name">{name}</span>
            {count !== undefined && (
                <span class="tag-count">{count.toLocaleString()}</span>
            )}
        </Tag>
    );
};

interface TagCloudProps {
    tags: TagInfo[];
    limit?: number;
}

export const TagCloud: FC<TagCloudProps> = ({ tags, limit }) => {
    const displayTags = limit ? tags.slice(0, limit) : tags;

    return (
        <div class="tag-cloud">
            {displayTags.map(tag => (
                <TagChip name={tag.name} count={tag.count} />
            ))}
        </div>
    );
};
