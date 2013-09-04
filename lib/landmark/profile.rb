require 'csv'

module Landmark
  class Profile
    attr_accessor :name
    attr_accessor :weight
    attr_accessor :events

    ####################################
    # Import
    ####################################

    # Imports a list of profiles from a JSON file.
    def self.load(path, options={})
      profiles = []
      json = JSON.parse(IO.read(File.expand_path(path)))
      json.each do |p|
        profiles << Profile.new(p)
      end
      return profiles
    end

    ####################################
    # Constructor
    ####################################

    def initialize(options={})
      from_hash(options)
    end


    ####################################
    # Encoding
    ####################################

    # Encodes the profile into a hash.
    def to_hash(*a)
      {
        'name' => name,
        'weight' => weight,
        'events' => events.to_a,
      }
    end

    def from_hash(h, *a)
      self.name = h.nil? ? nil : h["name"].to_s
      self.weight = h.nil? ? 1 : [h["weight"].to_i, 1].max
      self.events = h.nil? ? [] : h["events"].to_a
      nil
    end

    def as_json(*a); return to_hash(*a); end
    def to_json(*a); return as_json(*a).to_json; end


    ####################################
    # Event Generation
    ####################################

    # Generates a single timeline on a project based on the profile.
    def generate(project, user_id)
      timestamp = DateTime.iso8601("2000-01-01T00:00:00Z")

      events.each do |event|
        bounce_rate = event["bounce_rate"] || 0.0
        traits = event["traits"] || {}
        properties = event["properties"] || {}
        properties["__channel__"] = event["channel"] if event.has_key?("channel")
        properties["__resource__"] = event["resource"] if event.has_key?("resource")
        properties["__action__"] = event["action"] if event.has_key?("action")

        # Randomly determine the duration.
        min_duration, max_duration = *event["duration"]
        duration = min_duration + ((max_duration - min_duration) * rand)

        # Track the event.
        project.track(user_id, traits, properties, timestamp:timestamp)

        # Increment the timestamp.
        timestamp = timestamp + duration.seconds

        # Exit based on the bounce rate.
        return if rand() < bounce_rate
      end
    end
  end
end
