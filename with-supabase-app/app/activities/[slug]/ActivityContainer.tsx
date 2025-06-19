import { Activity } from "@/app/types/Activity";


interface ActivityContainerProps {
    activity: Activity;

}

export default function ActivityContainer( {activity}: ActivityContainerProps) {
    return (
        <div className="activity-container">
            <h1>{activity.name}</h1>
            <p>{activity.description}</p>
            <p>Category: {activity.category}</p>
            <p>Duration: {activity.duration_seconds} seconds</p>
            <p>Scoring Metric: {activity.scoring_metric}</p>

            {/* <a href={`/activities/${activity.activity_type}`}>Start Activity</a> */}
        </div>
    );
}